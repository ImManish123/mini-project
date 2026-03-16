package com.smarthome.service;

import com.smarthome.dto.SosRequest;
import com.smarthome.entity.*;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.SosAlertRepository;
import com.smarthome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SosService {

    private final SosAlertRepository sosAlertRepository;
    private final UserRepository userRepository;

    @Transactional
    public SosAlert createAlert(SosRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        SosAlert alert = SosAlert.builder()
                .user(user)
                .sosType(SosType.valueOf(request.getSosType()))
                .status(SosStatus.NOTIFIED)
                .location(request.getLocation())
                .description(request.getDescription())
                .build();

        return sosAlertRepository.save(alert);
    }

    public List<SosAlert> getMyAlerts(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return sosAlertRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public List<SosAlert> getAllAlerts() {
        return sosAlertRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<SosAlert> getAlertsByStatus(String status) {
        return sosAlertRepository.findByStatusOrderByCreatedAtDesc(SosStatus.valueOf(status));
    }

    @Transactional
    public SosAlert updateStatus(Long id, String status) {
        SosAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS Alert not found"));
        SosStatus newStatus = SosStatus.valueOf(status);
        alert.setStatus(newStatus);
        if (newStatus == SosStatus.RESOLVED) {
            alert.setResolvedAt(LocalDateTime.now());
        }
        return sosAlertRepository.save(alert);
    }

    @Transactional
    public SosAlert cancelAlert(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        SosAlert alert = sosAlertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SOS Alert not found"));
        if (!alert.getUser().getId().equals(user.getId())) {
            throw new com.smarthome.exception.AccessDeniedException("You can only cancel your own alerts");
        }
        alert.setStatus(SosStatus.CANCELLED);
        return sosAlertRepository.save(alert);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", sosAlertRepository.count());
        stats.put("initiated", sosAlertRepository.countByStatus(SosStatus.INITIATED));
        stats.put("notified", sosAlertRepository.countByStatus(SosStatus.NOTIFIED));
        stats.put("responding", sosAlertRepository.countByStatus(SosStatus.RESPONDING));
        stats.put("resolved", sosAlertRepository.countByStatus(SosStatus.RESOLVED));
        stats.put("cancelled", sosAlertRepository.countByStatus(SosStatus.CANCELLED));
        return stats;
    }
}
