package com.smarthome.service;

import com.smarthome.dto.ParkingBookingRequest;
import com.smarthome.dto.ParkingSlotRequest;
import com.smarthome.entity.*;
import com.smarthome.exception.BadRequestException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.ParkingBookingRepository;
import com.smarthome.repository.ParkingSlotRepository;
import com.smarthome.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ParkingService {

    private final ParkingSlotRepository parkingSlotRepository;
    private final ParkingBookingRepository parkingBookingRepository;
    private final UserRepository userRepository;

    // ===== Parking Slot Operations =====

    public List<ParkingSlot> getAllSlots() {
        return parkingSlotRepository.findAll();
    }

    public List<ParkingSlot> getActiveSlots() {
        return parkingSlotRepository.findByActiveTrue();
    }

    // Get only additional (non-allocated) bookable slots
    public List<ParkingSlot> getAdditionalSlots() {
        return parkingSlotRepository.findByIsAllocatedFalseAndActiveTrue();
    }

    public List<ParkingSlot> getAvailableSlots() {
        return parkingSlotRepository.findByIsAllocatedFalseAndStatusAndActiveTrue(ParkingSlotStatus.AVAILABLE);
    }

    public List<ParkingSlot> getAvailableSlotsByType(String type) {
        SlotType slotType = SlotType.valueOf(type.toUpperCase());
        return parkingSlotRepository.findBySlotTypeAndStatusAndActiveTrue(slotType, ParkingSlotStatus.AVAILABLE);
    }

    public ParkingSlot getSlotById(Long id) {
        return parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + id));
    }

    // ===== Allocated Slot Operations =====

    public List<ParkingSlot> getAllocatedSlots() {
        return parkingSlotRepository.findByIsAllocatedTrue();
    }

    public List<ParkingSlot> getMyAllocatedSlot(Long userId) {
        return parkingSlotRepository.findByAllocatedToUserId(userId);
    }

    @Transactional
    public ParkingSlot allocateSlotToResident(Long slotId, Long userId, String flatNumber) {
        ParkingSlot slot = getSlotById(slotId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        slot.setAllocatedToUser(user);
        slot.setFlatNumber(flatNumber);
        slot.setIsAllocated(true);
        slot.setStatus(ParkingSlotStatus.ALLOCATED);
        return parkingSlotRepository.save(slot);
    }

    @Transactional
    public ParkingSlot deallocateSlot(Long slotId) {
        ParkingSlot slot = getSlotById(slotId);
        slot.setAllocatedToUser(null);
        slot.setFlatNumber(null);
        slot.setIsAllocated(false);
        slot.setStatus(ParkingSlotStatus.AVAILABLE);
        return parkingSlotRepository.save(slot);
    }

    @Transactional
    public ParkingSlot createSlot(ParkingSlotRequest request) {
        if (parkingSlotRepository.existsBySlotNumber(request.getSlotNumber())) {
            throw new BadRequestException("Slot number already exists: " + request.getSlotNumber());
        }

        ParkingSlot slot = ParkingSlot.builder()
                .slotNumber(request.getSlotNumber())
                .floor(request.getFloor())
                .slotType(SlotType.valueOf(request.getSlotType().toUpperCase()))
                .status(ParkingSlotStatus.AVAILABLE)
                .pricePerHour(request.getPricePerHour())
                .location(request.getLocation())
                .isAllocated(false)
                .active(true)
                .build();

        return parkingSlotRepository.save(slot);
    }

    @Transactional
    public ParkingSlot updateSlot(Long id, ParkingSlotRequest request) {
        ParkingSlot slot = getSlotById(id);
        if (request.getSlotNumber() != null) slot.setSlotNumber(request.getSlotNumber());
        if (request.getFloor() != null) slot.setFloor(request.getFloor());
        if (request.getSlotType() != null) slot.setSlotType(SlotType.valueOf(request.getSlotType().toUpperCase()));
        if (request.getPricePerHour() != null) slot.setPricePerHour(request.getPricePerHour());
        if (request.getLocation() != null) slot.setLocation(request.getLocation());
        return parkingSlotRepository.save(slot);
    }

    @Transactional
    public ParkingSlot toggleSlotStatus(Long id) {
        ParkingSlot slot = getSlotById(id);
        if (slot.getIsAllocated()) {
            throw new BadRequestException("Cannot toggle status of an allocated slot");
        }
        if (slot.getStatus() == ParkingSlotStatus.MAINTENANCE) {
            slot.setStatus(ParkingSlotStatus.AVAILABLE);
        } else if (slot.getStatus() == ParkingSlotStatus.AVAILABLE) {
            slot.setStatus(ParkingSlotStatus.MAINTENANCE);
        }
        return parkingSlotRepository.save(slot);
    }

    @Transactional
    public ParkingSlot toggleSlotActive(Long id) {
        ParkingSlot slot = getSlotById(id);
        slot.setActive(!slot.getActive());
        return parkingSlotRepository.save(slot);
    }

    @Transactional
    public void deleteSlot(Long id) {
        ParkingSlot slot = getSlotById(id);
        // Check for active or pending bookings before deleting
        List<ParkingBooking> activeBookings = parkingBookingRepository.findByParkingSlotId(slot.getId())
                .stream()
                .filter(b -> b.getStatus() == ParkingBookingStatus.ACTIVE || b.getStatus() == ParkingBookingStatus.PENDING)
                .toList();
        if (!activeBookings.isEmpty()) {
            throw new BadRequestException("Cannot delete slot with active or pending bookings. Cancel them first.");
        }
        parkingSlotRepository.delete(slot);
    }

    // ===== Parking Booking Operations =====

    public List<ParkingBooking> getAllBookings() {
        return parkingBookingRepository.findAll();
    }

    public List<ParkingBooking> getMyBookings(Long userId) {
        return parkingBookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ParkingBooking> getActiveBookings(Long userId) {
        return parkingBookingRepository.findByUserIdAndStatus(userId, ParkingBookingStatus.ACTIVE);
    }

    public ParkingBooking getBookingById(Long id) {
        return parkingBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking booking not found with id: " + id));
    }

    @Transactional
    public ParkingBooking createBooking(Long userId, ParkingBookingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ParkingSlot slot = getSlotById(request.getSlotId());

        if (slot.getStatus() != ParkingSlotStatus.AVAILABLE) {
            throw new BadRequestException("This parking slot is not available");
        }

        if (!slot.getActive()) {
            throw new BadRequestException("This parking slot is inactive");
        }

        // Validate time
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new BadRequestException("Start time cannot be in the past");
        }

        // Check for conflicting bookings
        List<ParkingBooking> conflicts = parkingBookingRepository.findConflictingBookings(
                slot.getId(), request.getStartTime(), request.getEndTime());
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This slot is already booked for the selected time period");
        }

        // Calculate total amount
        long hours = Duration.between(request.getStartTime(), request.getEndTime()).toHours();
        if (hours < 1) hours = 1; // Minimum 1 hour
        double totalAmount = hours * slot.getPricePerHour();

        ParkingBooking booking = ParkingBooking.builder()
                .user(user)
                .parkingSlot(slot)
                .vehicleNumber(request.getVehicleNumber().toUpperCase())
                .vehicleType(request.getVehicleType())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .totalAmount(totalAmount)
                .status(ParkingBookingStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .notes(request.getNotes())
                .build();

        ParkingBooking saved = parkingBookingRepository.save(booking);

        // Slot stays AVAILABLE until payment is made
        return saved;
    }

    @Transactional
    public ParkingBooking payBooking(Long id) {
        ParkingBooking booking = getBookingById(id);
        if (booking.getStatus() != ParkingBookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be paid");
        }

        // Verify slot is still available
        ParkingSlot slot = booking.getParkingSlot();
        if (slot.getStatus() != ParkingSlotStatus.AVAILABLE) {
            throw new BadRequestException("This parking slot is no longer available. Please cancel and choose another slot.");
        }

        booking.setStatus(ParkingBookingStatus.ACTIVE);
        booking.setPaymentStatus(PaymentStatus.PAID);
        ParkingBooking saved = parkingBookingRepository.save(booking);

        // Now mark slot as booked (occupied)
        slot.setStatus(ParkingSlotStatus.BOOKED);
        parkingSlotRepository.save(slot);

        return saved;
    }

    @Transactional
    public ParkingBooking completeBooking(Long id) {
        ParkingBooking booking = getBookingById(id);
        if (booking.getStatus() != ParkingBookingStatus.ACTIVE) {
            throw new BadRequestException("Only active bookings can be completed");
        }
        booking.setStatus(ParkingBookingStatus.COMPLETED);
        ParkingBooking saved = parkingBookingRepository.save(booking);

        // Release the slot
        ParkingSlot slot = booking.getParkingSlot();
        slot.setStatus(ParkingSlotStatus.AVAILABLE);
        parkingSlotRepository.save(slot);

        return saved;
    }

    @Transactional
    public ParkingBooking cancelBooking(Long id) {
        ParkingBooking booking = getBookingById(id);
        if (booking.getStatus() != ParkingBookingStatus.ACTIVE && booking.getStatus() != ParkingBookingStatus.PENDING) {
            throw new BadRequestException("Only active or pending bookings can be cancelled");
        }

        // Only release slot if it was actually occupied (ACTIVE status)
        boolean wasActive = booking.getStatus() == ParkingBookingStatus.ACTIVE;

        booking.setStatus(ParkingBookingStatus.CANCELLED);
        ParkingBooking saved = parkingBookingRepository.save(booking);

        if (wasActive) {
            // Release the slot
            ParkingSlot slot = booking.getParkingSlot();
            slot.setStatus(ParkingSlotStatus.AVAILABLE);
            parkingSlotRepository.save(slot);
        }

        return saved;
    }

    // ===== Dashboard Stats =====

    public Map<String, Object> getParkingStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSlots", parkingSlotRepository.count());
        stats.put("activeSlots", parkingSlotRepository.countByActiveTrue());
        stats.put("availableSlots", parkingSlotRepository.countByStatus(ParkingSlotStatus.AVAILABLE));
        stats.put("bookedSlots", parkingSlotRepository.countByStatus(ParkingSlotStatus.BOOKED));
        stats.put("allocatedSlots", parkingSlotRepository.countByIsAllocatedTrue());
        stats.put("additionalSlots", parkingSlotRepository.countByIsAllocatedFalse());
        stats.put("maintenanceSlots", parkingSlotRepository.countByStatus(ParkingSlotStatus.MAINTENANCE));
        stats.put("totalBookings", parkingBookingRepository.count());
        stats.put("activeBookings", parkingBookingRepository.countByStatus(ParkingBookingStatus.ACTIVE));
        stats.put("pendingBookings", parkingBookingRepository.countByStatus(ParkingBookingStatus.PENDING));
        stats.put("completedBookings", parkingBookingRepository.countByStatus(ParkingBookingStatus.COMPLETED));
        stats.put("totalRevenue", parkingBookingRepository.getTotalParkingRevenue());
        return stats;
    }

    // Auto-release expired bookings — runs every 2 minutes
    @Scheduled(fixedRate = 120000)
    @Transactional
    public void releaseExpiredBookings() {
        List<ParkingBooking> expired = parkingBookingRepository.findExpiredActiveBookings(LocalDateTime.now());
        for (ParkingBooking booking : expired) {
            booking.setStatus(ParkingBookingStatus.COMPLETED);
            parkingBookingRepository.save(booking);

            ParkingSlot slot = booking.getParkingSlot();
            slot.setStatus(ParkingSlotStatus.AVAILABLE);
            parkingSlotRepository.save(slot);
            log.info("Auto-released expired parking booking #{} — slot {} is now AVAILABLE", booking.getId(), slot.getSlotNumber());
        }
    }

    // On startup, release any slots stuck as BOOKED with no active booking
    @PostConstruct
    @Transactional
    public void releaseStuckSlotsOnStartup() {
        // 1. Release expired active bookings
        releaseExpiredBookings();

        // 2. Find all BOOKED slots and check if they really have an active booking
        List<ParkingSlot> bookedSlots = parkingSlotRepository.findByStatus(ParkingSlotStatus.BOOKED);
        for (ParkingSlot slot : bookedSlots) {
            List<ParkingBooking> activeBookings = parkingBookingRepository.findByParkingSlotId(slot.getId())
                    .stream()
                    .filter(b -> b.getStatus() == ParkingBookingStatus.ACTIVE || b.getStatus() == ParkingBookingStatus.PENDING)
                    .toList();
            if (activeBookings.isEmpty()) {
                slot.setStatus(ParkingSlotStatus.AVAILABLE);
                parkingSlotRepository.save(slot);
                log.info("Startup recovery: Released stuck BOOKED slot {} — no active booking found", slot.getSlotNumber());
            }
        }
    }
}
