package com.smarthome.controller;

import com.smarthome.entity.*;
import com.smarthome.dto.ApiResponse;
import com.smarthome.exception.AccessDeniedException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.VendorRepository;
import com.smarthome.repository.UserRepository;
import com.smarthome.service.BookingService;
import com.smarthome.service.MessageService;
import com.smarthome.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worker")
@PreAuthorize("hasRole('WORKER')")
@RequiredArgsConstructor
public class WorkerController {

    private final BookingService bookingService;
    private final MessageService messageService;
    private final ReviewService reviewService;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        User worker = getCurrentUser();
        Vendor vendor = vendorRepository.findByUserId(worker.getId());

        Map<String, Object> stats = new HashMap<>();
        stats.put("vendorProfile", vendor);
        if (vendor != null) {
            stats.put("totalBookings", bookingService.getBookingsByWorker(worker.getId()).size());
            stats.put("availableBookings", bookingService.getAvailableBookingsForWorker(vendor).size());
        } else {
            stats.put("totalBookings", 0);
            stats.put("availableBookings", 0);
        }
        stats.put("pendingBookings", bookingService.countWorkerBookingsByStatus(worker.getId(), BookingStatus.PENDING));
        stats.put("confirmedBookings", bookingService.countWorkerBookingsByStatus(worker.getId(), BookingStatus.CONFIRMED));
        stats.put("completedBookings", bookingService.countWorkerBookingsByStatus(worker.getId(), BookingStatus.COMPLETED));
        stats.put("declinedBookings", bookingService.countWorkerBookingsByStatus(worker.getId(), BookingStatus.DECLINED));
        stats.put("unreadMessages", messageService.countUnreadByReceiver(worker.getId()));

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getMyBookings() {
        User worker = getCurrentUser();
        return ResponseEntity.ok(bookingService.getBookingsByWorker(worker.getId()));
    }

    @GetMapping("/bookings/pending")
    public ResponseEntity<List<Booking>> getPendingBookings() {
        User worker = getCurrentUser();
        // Get own pending bookings
        List<Booking> ownPending = bookingService.getWorkerBookingsByStatus(worker.getId(), BookingStatus.PENDING);
        return ResponseEntity.ok(ownPending);
    }

    @GetMapping("/bookings/available")
    public ResponseEntity<List<Booking>> getAvailableBookings() {
        User worker = getCurrentUser();
        Vendor vendor = vendorRepository.findByUserId(worker.getId());
        // Get all pending bookings in worker's area that they can accept
        return ResponseEntity.ok(bookingService.getAvailableBookingsForWorker(vendor));
    }

    @GetMapping("/bookings/confirmed")
    public ResponseEntity<List<Booking>> getConfirmedBookings() {
        User worker = getCurrentUser();
        return ResponseEntity.ok(bookingService.getWorkerBookingsByStatus(worker.getId(), BookingStatus.CONFIRMED));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        User worker = getCurrentUser();
        Booking booking = bookingService.getBookingById(id);
        // Allow worker to view only bookings assigned to them or available in their category
        if (booking.getVendor().getUser() != null && !booking.getVendor().getUser().getId().equals(worker.getId())) {
            // Check if it's an available pending booking in their category
            Vendor workerVendor = vendorRepository.findByUserId(worker.getId());
            if (workerVendor == null || booking.getStatus() != BookingStatus.PENDING || 
                !booking.getVendor().getCategory().getId().equals(workerVendor.getCategory().getId())) {
                throw new com.smarthome.exception.AccessDeniedException("You are not authorized to view this booking");
            }
        }
        return ResponseEntity.ok(booking);
    }

    @PatchMapping("/bookings/{id}/accept")
    public ResponseEntity<ApiResponse> acceptBooking(@PathVariable Long id) {
        User worker = getCurrentUser();
        Booking booking = bookingService.acceptBooking(id, worker.getId());
        return ResponseEntity.ok(ApiResponse.success("Booking accepted successfully", booking));
    }

    @PatchMapping("/bookings/{id}/decline")
    public ResponseEntity<ApiResponse> declineBooking(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        User worker = getCurrentUser();
        String reason = body != null ? body.get("reason") : null;
        Booking booking = bookingService.declineBooking(id, worker.getId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Booking declined", booking));
    }

    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse> updateBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User worker = getCurrentUser();
        Booking booking = bookingService.getBookingById(id);
        // Verify worker owns this booking's vendor
        if (booking.getVendor().getUser() == null || !booking.getVendor().getUser().getId().equals(worker.getId())) {
            throw new AccessDeniedException("Unauthorized");
        }
        Booking updated = bookingService.updateBookingStatus(id, body.get("status"));
        return ResponseEntity.ok(ApiResponse.success("Status updated", updated));
    }

    @GetMapping("/profile")
    public ResponseEntity<Vendor> getProfile() {
        User worker = getCurrentUser();
        Vendor vendor = vendorRepository.findByUserId(worker.getId());
        return ResponseEntity.ok(vendor);
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(@RequestBody Map<String, Object> updates) {
        User worker = getCurrentUser();
        Vendor vendor = vendorRepository.findByUserId(worker.getId());
        if (vendor == null) throw new ResourceNotFoundException("Vendor profile not found");

        if (updates.containsKey("name")) vendor.setName((String) updates.get("name"));
        if (updates.containsKey("phone")) vendor.setPhone((String) updates.get("phone"));
        if (updates.containsKey("description")) vendor.setDescription((String) updates.get("description"));
        if (updates.containsKey("serviceArea")) vendor.setServiceArea((String) updates.get("serviceArea"));
        if (updates.containsKey("servicePincodes")) vendor.setServicePincodes((String) updates.get("servicePincodes"));
        if (updates.containsKey("price")) vendor.setPrice(Double.parseDouble(updates.get("price").toString()));
        if (updates.containsKey("experienceYears")) vendor.setExperienceYears(Integer.parseInt(updates.get("experienceYears").toString()));
        if (updates.containsKey("availabilityStatus")) vendor.setAvailabilityStatus((Boolean) updates.get("availabilityStatus"));

        vendorRepository.save(vendor);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", vendor));
    }

    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getMyReviews() {
        User worker = getCurrentUser();
        Vendor vendor = vendorRepository.findByUserId(worker.getId());
        if (vendor == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(reviewService.getReviewsByVendor(vendor.getId()));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getMessages() {
        User worker = getCurrentUser();
        return ResponseEntity.ok(messageService.getMessagesByUser(worker.getId()));
    }

    @PatchMapping("/messages/read-all")
    public ResponseEntity<ApiResponse> markAllRead() {
        User worker = getCurrentUser();
        messageService.markAllAsReadByReceiver(worker.getId());
        return ResponseEntity.ok(ApiResponse.success("All messages marked as read", null));
    }
}
