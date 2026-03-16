package com.smarthome.service;

import com.smarthome.dto.LiftBookingRequest;
import com.smarthome.entity.*;
import com.smarthome.exception.BadRequestException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.LiftBookingRepository;
import com.smarthome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LiftBookingService {

    private final LiftBookingRepository liftBookingRepository;
    private final UserRepository userRepository;

    private static final int MAX_CONCURRENT_BOOKINGS = 2; // max 2 simultaneous lift bookings

    @Transactional
    public LiftBooking createBooking(LiftBookingRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        LocalDate date = LocalDate.parse(request.getBookingDate());
        LocalTime start = LocalTime.parse(request.getStartTime());
        LocalTime end = LocalTime.parse(request.getEndTime());

        if (!end.isAfter(start)) {
            throw new BadRequestException("End time must be after start time");
        }

        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Cannot book for a past date");
        }

        // Check for conflicts
        List<LiftBooking> conflicts = liftBookingRepository.findConflictingBookings(date, start, end);
        if (conflicts.size() >= MAX_CONCURRENT_BOOKINGS) {
            throw new BadRequestException("Lift is fully booked for the selected time slot. Please choose a different time.");
        }

        // Calculate amount based on duration (₹50 per 30 min slot)
        long minutes = java.time.Duration.between(start, end).toMinutes();
        double amount = Math.ceil(minutes / 30.0) * 50.0;

        // Determine payment status based on method
        PaymentStatus paymentStatus = PaymentStatus.PENDING;
        if ("CASH_ON_SERVICE".equals(request.getPaymentMethod())) {
            paymentStatus = PaymentStatus.CASH_ON_SERVICE;
        }

        LiftBooking booking = LiftBooking.builder()
                .user(user)
                .flatNumber(request.getFlatNumber())
                .bookingDate(date)
                .startTime(start)
                .endTime(end)
                .purpose(request.getPurpose())
                .numberOfGuests(request.getNumberOfGuests())
                .notes(request.getNotes())
                .status(LiftBookingStatus.CONFIRMED)
                .paymentStatus(paymentStatus)
                .totalAmount(amount)
                .build();

        return liftBookingRepository.save(booking);
    }

    public List<LiftBooking> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return liftBookingRepository.findByUserIdOrderByBookingDateDescStartTimeDesc(user.getId());
    }

    public List<LiftBooking> getAllBookings() {
        return liftBookingRepository.findAllByOrderByBookingDateDescStartTimeDesc();
    }

    public List<LiftBooking> getBookingsByDate(String date) {
        return liftBookingRepository.findByBookingDateOrderByStartTime(LocalDate.parse(date));
    }

    public LiftBooking getBookingById(Long id) {
        return liftBookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lift booking not found"));
    }

    @Transactional
    public LiftBooking cancelBooking(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        LiftBooking booking = getBookingById(id);

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new com.smarthome.exception.AccessDeniedException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == LiftBookingStatus.COMPLETED || booking.getStatus() == LiftBookingStatus.CANCELLED) {
            throw new BadRequestException("This booking cannot be cancelled");
        }

        booking.setStatus(LiftBookingStatus.CANCELLED);

        // Refund if payment was made
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            booking.setPaymentStatus(PaymentStatus.REFUNDED);
        }

        return liftBookingRepository.save(booking);
    }

    @Transactional
    public LiftBooking updateStatus(Long id, String status) {
        LiftBooking booking = getBookingById(id);
        booking.setStatus(LiftBookingStatus.valueOf(status));
        return liftBookingRepository.save(booking);
    }

    @Transactional
    public LiftBooking simulatePayment(Long id) {
        LiftBooking booking = getBookingById(id);
        if (booking.getPaymentStatus() == PaymentStatus.PAID) {
            throw new BadRequestException("This booking is already paid");
        }
        booking.setPaymentStatus(PaymentStatus.PAID);
        return liftBookingRepository.save(booking);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", liftBookingRepository.count());
        stats.put("pending", liftBookingRepository.countByStatus(LiftBookingStatus.PENDING));
        stats.put("confirmed", liftBookingRepository.countByStatus(LiftBookingStatus.CONFIRMED));
        stats.put("active", liftBookingRepository.countByStatus(LiftBookingStatus.ACTIVE));
        stats.put("completed", liftBookingRepository.countByStatus(LiftBookingStatus.COMPLETED));
        stats.put("cancelled", liftBookingRepository.countByStatus(LiftBookingStatus.CANCELLED));

        // Today's bookings
        List<LiftBooking> todayBookings = liftBookingRepository.findByBookingDateOrderByStartTime(LocalDate.now());
        stats.put("todayBookings", todayBookings.size());

        // Payment stats
        stats.put("paid", liftBookingRepository.countByPaymentStatus(PaymentStatus.PAID));
        stats.put("paymentPending", liftBookingRepository.countByPaymentStatus(PaymentStatus.PENDING));

        return stats;
    }

    public List<LiftBooking> getAvailableSlots(String date) {
        return liftBookingRepository.findByBookingDateOrderByStartTime(LocalDate.parse(date));
    }
}
