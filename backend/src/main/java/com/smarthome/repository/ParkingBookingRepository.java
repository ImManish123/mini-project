package com.smarthome.repository;

import com.smarthome.entity.ParkingBooking;
import com.smarthome.entity.ParkingBookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ParkingBookingRepository extends JpaRepository<ParkingBooking, Long> {
    List<ParkingBooking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<ParkingBooking> findByParkingSlotId(Long slotId);
    List<ParkingBooking> findByStatus(ParkingBookingStatus status);

    @Query("SELECT pb FROM ParkingBooking pb WHERE pb.user.id = :userId AND pb.status = :status ORDER BY pb.createdAt DESC")
    List<ParkingBooking> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ParkingBookingStatus status);

    @Query("SELECT pb FROM ParkingBooking pb WHERE pb.parkingSlot.id = :slotId AND pb.status IN ('ACTIVE', 'PENDING') " +
           "AND ((pb.startTime <= :endTime AND pb.endTime >= :startTime))")
    List<ParkingBooking> findConflictingBookings(@Param("slotId") Long slotId,
                                                  @Param("startTime") LocalDateTime startTime,
                                                  @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(pb) FROM ParkingBooking pb WHERE pb.status = :status")
    long countByStatus(@Param("status") ParkingBookingStatus status);

    @Query("SELECT COALESCE(SUM(pb.totalAmount), 0) FROM ParkingBooking pb WHERE pb.status = 'COMPLETED'")
    Double getTotalParkingRevenue();

    @Query("SELECT pb FROM ParkingBooking pb WHERE pb.status = 'ACTIVE' AND pb.endTime < :now")
    List<ParkingBooking> findExpiredActiveBookings(@Param("now") LocalDateTime now);
}
