package com.smarthome.repository;

import com.smarthome.entity.ParkingSlot;
import com.smarthome.entity.ParkingSlotStatus;
import com.smarthome.entity.SlotType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {
    List<ParkingSlot> findByActiveTrue();
    List<ParkingSlot> findByStatus(ParkingSlotStatus status);
    List<ParkingSlot> findBySlotType(SlotType slotType);
    List<ParkingSlot> findByStatusAndActiveTrue(ParkingSlotStatus status);
    List<ParkingSlot> findBySlotTypeAndStatusAndActiveTrue(SlotType slotType, ParkingSlotStatus status);
    List<ParkingSlot> findByFloor(String floor);
    Optional<ParkingSlot> findBySlotNumber(String slotNumber);
    boolean existsBySlotNumber(String slotNumber);
    long countByStatus(ParkingSlotStatus status);
    long countByActiveTrue();

    // Allocated slots
    List<ParkingSlot> findByIsAllocatedTrue();
    List<ParkingSlot> findByIsAllocatedFalseAndActiveTrue();
    List<ParkingSlot> findByIsAllocatedFalseAndStatusAndActiveTrue(ParkingSlotStatus status);
    List<ParkingSlot> findByAllocatedToUserId(Long userId);
    long countByIsAllocatedTrue();
    long countByIsAllocatedFalse();
}
