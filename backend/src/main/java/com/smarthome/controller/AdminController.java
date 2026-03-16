package com.smarthome.controller;

import com.smarthome.dto.DashboardStats;
import com.smarthome.entity.*;
import com.smarthome.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final VendorService vendorService;
    private final BookingService bookingService;
    private final MessageService messageService;
    private final ParkingService parkingService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        DashboardStats stats = DashboardStats.builder()
                .totalBookings(bookingService.countByStatus(BookingStatus.PENDING) + 
                               bookingService.countByStatus(BookingStatus.CONFIRMED) + 
                               bookingService.countByStatus(BookingStatus.COMPLETED) + 
                               bookingService.countByStatus(BookingStatus.CANCELLED) +
                               bookingService.countDeclined())
                .pendingBookings(bookingService.countByStatus(BookingStatus.PENDING))
                .completedBookings(bookingService.countByStatus(BookingStatus.COMPLETED))
                .cancelledBookings(bookingService.countByStatus(BookingStatus.CANCELLED))
                .totalVendors(vendorService.countAllVendors())
                .activeVendors(vendorService.countActiveVendors())
                .totalCustomers(userService.countCustomers())
                .totalRevenue(bookingService.getTotalRevenue())
                .monthlyRevenue(bookingService.getMonthlyRevenue())
                .todayBookings(bookingService.getTodayBookings())
                .build();

        // Add extra fields as a map
        Map<String, Object> response = new HashMap<>();
        response.put("stats", stats);
        response.put("declinedBookings", bookingService.countDeclined());
        response.put("totalWorkers", userService.getUsersByRole(Role.WORKER).size());
        response.put("unreadMessages", messageService.countUnreadByAdmin());
        response.put("parkingStats", parkingService.getParkingStats());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/users/customers")
    public ResponseEntity<List<User>> getCustomers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.CUSTOMER));
    }

    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<User> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/workers")
    public ResponseEntity<List<User>> getWorkers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.WORKER));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getAllMessages() {
        return ResponseEntity.ok(messageService.getAllMessages());
    }

    @GetMapping("/messages/unread")
    public ResponseEntity<List<Message>> getUnreadMessages() {
        return ResponseEntity.ok(messageService.getUnreadByAdmin());
    }

    @PatchMapping("/messages/{id}/read")
    public ResponseEntity<Void> markMessageRead(@PathVariable Long id) {
        messageService.markAsReadByAdmin(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/messages/read-all")
    public ResponseEntity<Void> markAllMessagesRead() {
        messageService.markAllAsReadByAdmin();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/bookings/{id}/decline")
    public ResponseEntity<Booking> declineBooking(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(bookingService.adminDeclineBooking(id, reason));
    }
}
