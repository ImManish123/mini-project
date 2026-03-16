package com.smarthome.controller;

import com.smarthome.dto.ParkingBookingRequest;
import com.smarthome.dto.ParkingSlotRequest;
import com.smarthome.entity.ParkingBooking;
import com.smarthome.entity.ParkingSlot;
import com.smarthome.entity.User;
import com.smarthome.exception.AccessDeniedException;
import com.smarthome.service.ParkingService;
import com.smarthome.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parking")
@RequiredArgsConstructor
public class ParkingController {

    private final ParkingService parkingService;
    private final UserService userService;

    private User getAuthenticatedUser(UserDetails userDetails) {
        if (userDetails == null) {
            throw new AccessDeniedException("Authentication required");
        }
        return userService.getUserByEmail(userDetails.getUsername());
    }

    // ===== Public / Authenticated - Slot viewing =====

    @GetMapping("/slots")
    public ResponseEntity<List<ParkingSlot>> getActiveSlots() {
        return ResponseEntity.ok(parkingService.getActiveSlots());
    }

    // Get only additional (non-allocated) bookable slots
    @GetMapping("/slots/additional")
    public ResponseEntity<List<ParkingSlot>> getAdditionalSlots() {
        return ResponseEntity.ok(parkingService.getAdditionalSlots());
    }

    @GetMapping("/slots/available")
    public ResponseEntity<List<ParkingSlot>> getAvailableSlots() {
        return ResponseEntity.ok(parkingService.getAvailableSlots());
    }

    @GetMapping("/slots/available/{type}")
    public ResponseEntity<List<ParkingSlot>> getAvailableSlotsByType(@PathVariable String type) {
        return ResponseEntity.ok(parkingService.getAvailableSlotsByType(type));
    }

    @GetMapping("/slots/{id}")
    public ResponseEntity<ParkingSlot> getSlotById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingService.getSlotById(id));
    }

    // ===== Allocated Slot Endpoints =====

    @GetMapping("/slots/allocated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ParkingSlot>> getAllocatedSlots() {
        return ResponseEntity.ok(parkingService.getAllocatedSlots());
    }

    @GetMapping("/slots/my-allocated")
    public ResponseEntity<List<ParkingSlot>> getMyAllocatedSlot(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(parkingService.getMyAllocatedSlot(user.getId()));
    }

    @PatchMapping("/slots/{slotId}/allocate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> allocateSlotToResident(
            @PathVariable Long slotId,
            @RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        String flatNumber = body.get("flatNumber").toString();
        return ResponseEntity.ok(parkingService.allocateSlotToResident(slotId, userId, flatNumber));
    }

    @PatchMapping("/slots/{slotId}/deallocate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> deallocateSlot(@PathVariable Long slotId) {
        return ResponseEntity.ok(parkingService.deallocateSlot(slotId));
    }

    // ===== Admin - Slot Management =====

    @GetMapping("/slots/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        return ResponseEntity.ok(parkingService.getAllSlots());
    }

    @PostMapping("/slots")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> createSlot(@RequestBody ParkingSlotRequest request) {
        return ResponseEntity.ok(parkingService.createSlot(request));
    }

    @PutMapping("/slots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> updateSlot(@PathVariable Long id, @RequestBody ParkingSlotRequest request) {
        return ResponseEntity.ok(parkingService.updateSlot(id, request));
    }

    @PatchMapping("/slots/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> toggleSlotStatus(@PathVariable Long id) {
        return ResponseEntity.ok(parkingService.toggleSlotStatus(id));
    }

    @PatchMapping("/slots/{id}/toggle-active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ParkingSlot> toggleSlotActive(@PathVariable Long id) {
        return ResponseEntity.ok(parkingService.toggleSlotActive(id));
    }

    @DeleteMapping("/slots/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSlot(@PathVariable Long id) {
        parkingService.deleteSlot(id);
        return ResponseEntity.ok().build();
    }

    // ===== Customer - Booking Operations =====

    @PostMapping("/bookings")
    public ResponseEntity<ParkingBooking> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ParkingBookingRequest request) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(parkingService.createBooking(user.getId(), request));
    }

    @GetMapping("/bookings/my-bookings")
    public ResponseEntity<List<ParkingBooking>> getMyBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(parkingService.getMyBookings(user.getId()));
    }

    @GetMapping("/bookings/active")
    public ResponseEntity<List<ParkingBooking>> getActiveBookings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getAuthenticatedUser(userDetails);
        return ResponseEntity.ok(parkingService.getActiveBookings(user.getId()));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ParkingBooking> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ParkingBooking booking = parkingService.getBookingById(id);
        User user = getAuthenticatedUser(userDetails);
        if (!user.getRole().name().equals("ADMIN") && !booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only view your own parking bookings");
        }
        return ResponseEntity.ok(booking);
    }

    @PatchMapping("/bookings/{id}/complete")
    public ResponseEntity<ParkingBooking> completeBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ParkingBooking booking = parkingService.getBookingById(id);
        User user = getAuthenticatedUser(userDetails);
        if (!user.getRole().name().equals("ADMIN") && !booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only complete your own parking bookings");
        }
        return ResponseEntity.ok(parkingService.completeBooking(id));
    }

    @PatchMapping("/bookings/{id}/pay")
    public ResponseEntity<ParkingBooking> payBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ParkingBooking booking = parkingService.getBookingById(id);
        User user = getAuthenticatedUser(userDetails);
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only pay for your own parking bookings");
        }
        return ResponseEntity.ok(parkingService.payBooking(id));
    }

    @PatchMapping("/bookings/{id}/cancel")
    public ResponseEntity<ParkingBooking> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        ParkingBooking booking = parkingService.getBookingById(id);
        User user = getAuthenticatedUser(userDetails);
        if (!user.getRole().name().equals("ADMIN") && !booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only cancel your own parking bookings");
        }
        return ResponseEntity.ok(parkingService.cancelBooking(id));
    }

    // ===== Admin - Booking Management =====

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ParkingBooking>> getAllBookings() {
        return ResponseEntity.ok(parkingService.getAllBookings());
    }

    // ===== Dashboard Stats =====

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getParkingStats() {
        return ResponseEntity.ok(parkingService.getParkingStats());
    }
}
