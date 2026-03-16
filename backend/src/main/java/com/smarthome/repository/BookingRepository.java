package com.smarthome.repository;

import com.smarthome.entity.Booking;
import com.smarthome.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByVendorId(Long vendorId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Booking> findByVendorIdAndBookingDate(Long vendorId, LocalDate bookingDate);
    
    @Query("SELECT b FROM Booking b WHERE b.vendor.id = :vendorId AND b.bookingDate = :date AND b.status != 'CANCELLED'")
    List<Booking> findActiveBookingsByVendorAndDate(@Param("vendorId") Long vendorId, @Param("date") LocalDate date);
    
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS') ORDER BY b.bookingDate ASC")
    List<Booking> findUpcomingBookings(@Param("userId") Long userId);
    
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = 'COMPLETED' ORDER BY b.bookingDate DESC")
    List<Booking> findCompletedBookings(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") BookingStatus status);
    
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.paymentStatus = 'PAID' AND b.status = 'COMPLETED'")
    Double getTotalRevenue();
    
    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.paymentStatus = 'PAID' AND b.status = 'COMPLETED' AND b.bookingDate BETWEEN :startDate AND :endDate")
    Double getRevenueByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingDate = :date")
    long countBookingsByDate(@Param("date") LocalDate date);

    @Query("SELECT b FROM Booking b WHERE b.vendor.user.id = :workerId ORDER BY b.createdAt DESC")
    List<Booking> findByWorkerUserId(@Param("workerId") Long workerId);

    @Query("SELECT b FROM Booking b WHERE b.vendor.user.id = :workerId AND b.status = :status ORDER BY b.createdAt DESC")
    List<Booking> findByWorkerUserIdAndStatus(@Param("workerId") Long workerId, @Param("status") BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.vendor.user.id = :workerId AND b.status = :status")
    long countByWorkerUserIdAndStatus(@Param("workerId") Long workerId, @Param("status") BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'DECLINED'")
    long countDeclined();

    // Find pending bookings by category and pincode (for area-based worker matching)
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.vendor.category.id = :categoryId ORDER BY b.createdAt DESC")
    List<Booking> findPendingBookingsByCategory(@Param("categoryId") Long categoryId);

    // Find all bookings matching a pincode pattern
    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND b.vendor.category.id = :categoryId AND b.servicePincode = :pincode ORDER BY b.createdAt DESC")
    List<Booking> findPendingBookingsByCategoryAndPincode(@Param("categoryId") Long categoryId, @Param("pincode") String pincode);
}
