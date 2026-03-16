package com.smarthome.repository;

import com.smarthome.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByVendorId(Long vendorId);
    List<Review> findByUserId(Long userId);
    List<Review> findByVendorIdOrderByCreatedAtDesc(Long vendorId);

    @Query("SELECT r FROM Review r WHERE r.rating >= 4 AND r.comment IS NOT NULL AND r.comment != '' ORDER BY r.rating DESC, r.createdAt DESC")
    List<Review> findTopRatedReviews();

    @Query("SELECT r FROM Review r WHERE r.atsScore IS NOT NULL AND r.atsScore > 0 ORDER BY r.atsScore DESC, r.createdAt DESC")
    List<Review> findTopAtsReviews();

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vendor.id = :vendorId")
    Double getAverageRatingByVendorId(@Param("vendorId") Long vendorId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.vendor.id = :vendorId")
    long countByVendorId(@Param("vendorId") Long vendorId);

    boolean existsByUserIdAndBookingId(Long userId, Long bookingId);
}
