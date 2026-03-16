package com.smarthome.service;

import com.smarthome.dto.ComplaintRequest;
import com.smarthome.entity.*;
import com.smarthome.exception.AccessDeniedException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.ComplaintRepository;
import com.smarthome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;

    @Transactional
    public Complaint fileComplaint(ComplaintRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Complaint complaint = Complaint.builder()
                .user(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(ComplaintCategory.valueOf(request.getCategory()))
                .location(request.getLocation())
                .priority(ComplaintPriority.MEDIUM)
                .status(ComplaintStatus.OPEN)
                .build();

        return complaintRepository.save(complaint);
    }

    public List<Complaint> getMyComplaints(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return complaintRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Complaint> getActiveComplaints() {
        return complaintRepository.findActiveComplaintsByPriority();
    }

    public List<Complaint> getByStatus(String status) {
        return complaintRepository.findByStatusOrderByCreatedAtDesc(ComplaintStatus.valueOf(status));
    }

    public List<Complaint> getByCategory(String category) {
        return complaintRepository.findByCategoryOrderByCreatedAtDesc(ComplaintCategory.valueOf(category));
    }

    public Complaint getById(Long id) {
        return complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
    }

    @Transactional
    public Complaint updateStatus(Long id, String status) {
        Complaint complaint = getById(id);
        ComplaintStatus newStatus = ComplaintStatus.valueOf(status);
        complaint.setStatus(newStatus);

        if (newStatus == ComplaintStatus.RESOLVED || newStatus == ComplaintStatus.CLOSED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }

        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint updatePriority(Long id, String priority) {
        Complaint complaint = getById(id);
        complaint.setPriority(ComplaintPriority.valueOf(priority));
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint assignWorker(Long id, Long workerId) {
        Complaint complaint = getById(id);
        User worker = userRepository.findById(workerId)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        complaint.setAssignedWorker(worker);
        if (complaint.getStatus() == ComplaintStatus.OPEN) {
            complaint.setStatus(ComplaintStatus.IN_PROGRESS);
        }
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint addAdminResponse(Long id, String response) {
        Complaint complaint = getById(id);
        complaint.setAdminResponse(response);
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getWorkerAssignedComplaints(String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        return complaintRepository.findByAssignedWorkerIdOrderByCreatedAtDesc(worker.getId());
    }

    @Transactional
    public Complaint workerUpdateStatus(Long id, String status, String workerEmail) {
        User worker = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Worker not found"));
        Complaint complaint = getById(id);

        if (complaint.getAssignedWorker() == null || !complaint.getAssignedWorker().getId().equals(worker.getId())) {
            throw new AccessDeniedException("Not assigned to this complaint");
        }

        ComplaintStatus newStatus = ComplaintStatus.valueOf(status);
        complaint.setStatus(newStatus);
        if (newStatus == ComplaintStatus.RESOLVED) {
            complaint.setResolvedAt(LocalDateTime.now());
        }
        return complaintRepository.save(complaint);
    }

    @Transactional
    public void deleteComplaint(Long id) {
        complaintRepository.deleteById(id);
    }

    public Map<String, Object> getComplaintStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalComplaints", complaintRepository.count());
        stats.put("openComplaints", complaintRepository.countByStatus(ComplaintStatus.OPEN));
        stats.put("inProgressComplaints", complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS));
        stats.put("resolvedComplaints", complaintRepository.countByStatus(ComplaintStatus.RESOLVED));
        stats.put("closedComplaints", complaintRepository.countByStatus(ComplaintStatus.CLOSED));
        stats.put("urgentComplaints", complaintRepository.countByPriority(ComplaintPriority.URGENT));
        stats.put("highPriorityComplaints", complaintRepository.countByPriority(ComplaintPriority.HIGH));

        // Category breakdown
        Map<String, Long> categoryStats = new HashMap<>();
        for (Object[] row : complaintRepository.countByCategories()) {
            categoryStats.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("categoryBreakdown", categoryStats);

        // Status breakdown
        Map<String, Long> statusStats = new HashMap<>();
        for (Object[] row : complaintRepository.countByStatuses()) {
            statusStats.put(row[0].toString(), (Long) row[1]);
        }
        stats.put("statusBreakdown", statusStats);

        return stats;
    }
}
