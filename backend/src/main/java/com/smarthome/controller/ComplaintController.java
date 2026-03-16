package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.dto.ComplaintRequest;
import com.smarthome.entity.Complaint;
import com.smarthome.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    // === Customer Endpoints ===

    @PostMapping
    public ResponseEntity<Complaint> fileComplaint(@RequestBody ComplaintRequest request, Authentication auth) {
        Complaint complaint = complaintService.fileComplaint(request, auth.getName());
        return ResponseEntity.ok(complaint);
    }

    @GetMapping("/my-complaints")
    public ResponseEntity<List<Complaint>> getMyComplaints(Authentication auth) {
        return ResponseEntity.ok(complaintService.getMyComplaints(auth.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getById(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getById(id));
    }

    // === Admin Endpoints ===

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.getAllComplaints());
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getActiveComplaints() {
        return ResponseEntity.ok(complaintService.getActiveComplaints());
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(complaintService.getByStatus(status));
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Complaint>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(complaintService.getByCategory(category));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Complaint> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Complaint updated = complaintService.updateStatus(id, body.get("status"));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Complaint> updatePriority(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Complaint updated = complaintService.updatePriority(id, body.get("priority"));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Complaint> assignWorker(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Complaint updated = complaintService.assignWorker(id, body.get("workerId"));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/respond")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Complaint> addAdminResponse(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Complaint updated = complaintService.addAdminResponse(id, body.get("response"));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.ok(ApiResponse.success("Complaint deleted"));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(complaintService.getComplaintStats());
    }

    // === Worker Endpoints ===

    @GetMapping("/worker/assigned")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<List<Complaint>> getWorkerAssigned(Authentication auth) {
        return ResponseEntity.ok(complaintService.getWorkerAssignedComplaints(auth.getName()));
    }

    @PatchMapping("/worker/{id}/status")
    @PreAuthorize("hasRole('WORKER')")
    public ResponseEntity<Complaint> workerUpdateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) {
        Complaint updated = complaintService.workerUpdateStatus(id, body.get("status"), auth.getName());
        return ResponseEntity.ok(updated);
    }
}
