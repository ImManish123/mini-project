package com.smarthome.controller;

import com.smarthome.dto.LiftBookingRequest;
import com.smarthome.entity.LiftBooking;
import com.smarthome.service.LiftBookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lift-bookings")
@RequiredArgsConstructor
public class LiftBookingController {

    private final LiftBookingService liftBookingService;

    // Customer endpoints
    @PostMapping
    public ResponseEntity<LiftBooking> createBooking(@RequestBody LiftBookingRequest request, Authentication auth) {
        return ResponseEntity.ok(liftBookingService.createBooking(request, auth.getName()));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<LiftBooking>> getMyBookings(Authentication auth) {
        return ResponseEntity.ok(liftBookingService.getMyBookings(auth.getName()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<LiftBooking> cancelBooking(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(liftBookingService.cancelBooking(id, auth.getName()));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<LiftBooking> payBooking(@PathVariable Long id) {
        return ResponseEntity.ok(liftBookingService.simulatePayment(id));
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<List<LiftBooking>> getByDate(@PathVariable String date) {
        return ResponseEntity.ok(liftBookingService.getBookingsByDate(date));
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LiftBooking>> getAllBookings() {
        return ResponseEntity.ok(liftBookingService.getAllBookings());
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LiftBooking> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(liftBookingService.updateStatus(id, body.get("status")));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(liftBookingService.getStats());
    }
}
