package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.dto.SosRequest;
import com.smarthome.entity.SosAlert;
import com.smarthome.service.SosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sos")
@RequiredArgsConstructor
public class SosController {

    private final SosService sosService;

    // Customer endpoints
    @PostMapping
    public ResponseEntity<SosAlert> createAlert(@RequestBody SosRequest request, Authentication auth) {
        SosAlert alert = sosService.createAlert(request, auth.getName());
        return ResponseEntity.ok(alert);
    }

    @GetMapping("/my-alerts")
    public ResponseEntity<List<SosAlert>> getMyAlerts(Authentication auth) {
        return ResponseEntity.ok(sosService.getMyAlerts(auth.getName()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<SosAlert> cancelAlert(@PathVariable Long id, Authentication auth) {
        return ResponseEntity.ok(sosService.cancelAlert(id, auth.getName()));
    }

    // Admin endpoints
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SosAlert>> getAllAlerts() {
        return ResponseEntity.ok(sosService.getAllAlerts());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SosAlert>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(sosService.getAlertsByStatus(status));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SosAlert> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(sosService.updateStatus(id, body.get("status")));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(sosService.getStats());
    }
}
