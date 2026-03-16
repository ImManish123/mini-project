package com.smarthome.repository;

import com.smarthome.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    List<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);

    List<Complaint> findByCategoryOrderByCreatedAtDesc(ComplaintCategory category);

    List<Complaint> findByPriorityOrderByCreatedAtDesc(ComplaintPriority priority);

    List<Complaint> findByAssignedWorkerIdOrderByCreatedAtDesc(Long workerId);

    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatus(ComplaintStatus status);

    long countByPriority(ComplaintPriority priority);

    long countByCategory(ComplaintCategory category);

    long countByUserId(Long userId);

    @Query("SELECT c FROM Complaint c WHERE c.status IN ('OPEN', 'IN_PROGRESS') ORDER BY " +
           "CASE c.priority WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END, c.createdAt ASC")
    List<Complaint> findActiveComplaintsByPriority();

    @Query("SELECT c.category, COUNT(c) FROM Complaint c GROUP BY c.category")
    List<Object[]> countByCategories();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countByStatuses();
}
