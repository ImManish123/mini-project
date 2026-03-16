package com.smarthome.repository;

import com.smarthome.entity.LiftBooking;
import com.smarthome.entity.LiftBookingStatus;
import com.smarthome.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface LiftBookingRepository extends JpaRepository<LiftBooking, Long> {
    List<LiftBooking> findByUserIdOrderByBookingDateDescStartTimeDesc(Long userId);
    List<LiftBooking> findAllByOrderByBookingDateDescStartTimeDesc();
    List<LiftBooking> findByBookingDateOrderByStartTime(LocalDate date);
    long countByStatus(LiftBookingStatus status);
    long countByPaymentStatus(PaymentStatus paymentStatus);

    @Query("SELECT lb FROM LiftBooking lb WHERE lb.bookingDate = :date AND lb.status NOT IN ('CANCELLED', 'COMPLETED') " +
           "AND ((lb.startTime < :endTime AND lb.endTime > :startTime))")
    List<LiftBooking> findConflictingBookings(@Param("date") LocalDate date,
                                               @Param("startTime") LocalTime startTime,
                                               @Param("endTime") LocalTime endTime);
}
