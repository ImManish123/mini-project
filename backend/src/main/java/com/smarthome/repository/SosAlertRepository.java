package com.smarthome.repository;

import com.smarthome.entity.SosAlert;
import com.smarthome.entity.SosStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SosAlertRepository extends JpaRepository<SosAlert, Long> {
    List<SosAlert> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<SosAlert> findAllByOrderByCreatedAtDesc();
    List<SosAlert> findByStatusOrderByCreatedAtDesc(SosStatus status);
    long countByStatus(SosStatus status);
}
