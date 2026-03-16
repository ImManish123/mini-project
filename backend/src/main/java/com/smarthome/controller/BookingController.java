package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.dto.BookingRequest;
import com.smarthome.entity.Booking;
import com.smarthome.entity.User;
import com.smarthome.exception.AccessDeniedException;
import com.smarthome.service.BookingService;
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
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Booking booking = bookingService.getBookingById(id);
        User user = userService.getUserByEmail(userDetails.getUsername());
        // Allow admin or the booking owner to view
        if (!user.getRole().name().equals("ADMIN") && !booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only view your own bookings");
        }
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<Booking>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(bookingService.getBookingsByUser(user.getId()));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Booking>> getUpcomingBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(bookingService.getUpcomingBookings(user.getId()));
    }

    @GetMapping("/completed")
    public ResponseEntity<List<Booking>> getCompletedBookings(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(bookingService.getCompletedBookings(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody BookingRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(bookingService.createBooking(user.getId(), request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Booking> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, body.get("status")));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) Map<String, String> body) {
        Booking booking = bookingService.getBookingById(id);
        User user = userService.getUserByEmail(userDetails.getUsername());
        if (!user.getRole().name().equals("ADMIN") && !booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only cancel your own bookings");
        }
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(bookingService.cancelBooking(id, reason));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Booking> simulatePayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Booking booking = bookingService.getBookingById(id);
        User user = userService.getUserByEmail(userDetails.getUsername());
        if (!booking.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You can only pay for your own bookings");
        }
        return ResponseEntity.ok(bookingService.simulatePayment(id));
    }
}
