package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.dto.VendorRequest;
import com.smarthome.entity.Vendor;
import com.smarthome.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @GetMapping
    public ResponseEntity<List<Vendor>> getApprovedVendors() {
        return ResponseEntity.ok(vendorService.getApprovedVendors());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Vendor>> getAllVendors() {
        return ResponseEntity.ok(vendorService.getAllVendors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vendor> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<Vendor>> getVendorsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(required = false) String pincode) {
        if (pincode != null && !pincode.isEmpty()) {
            return ResponseEntity.ok(vendorService.getVendorsByCategoryAndPincode(categoryId, pincode));
        }
        return ResponseEntity.ok(vendorService.getVendorsByCategory(categoryId));
    }

    @GetMapping("/by-pincode")
    public ResponseEntity<List<Vendor>> getVendorsByPincode(@RequestParam String pincode) {
        return ResponseEntity.ok(vendorService.getVendorsByPincode(pincode));
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<Vendor>> getTopRatedVendors() {
        return ResponseEntity.ok(vendorService.getTopRatedVendors());
    }

    @GetMapping("/{vendorId}/slots")
    public ResponseEntity<List<String>> getAvailableSlots(
            @PathVariable Long vendorId,
            @RequestParam String date) {
        return ResponseEntity.ok(vendorService.getAvailableTimeSlots(vendorId, date));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> createVendor(@Valid @RequestBody VendorRequest request) {
        return ResponseEntity.ok(vendorService.createVendor(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> updateVendor(@PathVariable Long id, @Valid @RequestBody VendorRequest request) {
        return ResponseEntity.ok(vendorService.updateVendor(id, request));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> approveVendor(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.approveVendor(id));
    }

    @PatchMapping("/{id}/block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> blockVendor(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.blockVendor(id));
    }

    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vendor> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.toggleAvailability(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor deleted successfully"));
    }
}
