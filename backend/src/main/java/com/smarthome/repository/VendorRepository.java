package com.smarthome.repository;

import com.smarthome.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    List<Vendor> findByCategoryId(Long categoryId);
    Vendor findByUserId(Long userId);
    boolean existsByUserId(Long userId);
    List<Vendor> findByApprovedTrueAndBlockedFalse();
    List<Vendor> findByCategoryIdAndApprovedTrueAndBlockedFalse(Long categoryId);
    List<Vendor> findByAvailabilityStatusTrue();
    List<Vendor> findByBlocked(Boolean blocked);
    List<Vendor> findByApproved(Boolean approved);
    long countByApprovedTrue();
    long countByBlockedTrue();
    
    @Query("SELECT v FROM Vendor v WHERE v.approved = true AND v.blocked = false ORDER BY v.rating DESC")
    List<Vendor> findTopRatedVendors();
    
    @Query("SELECT v FROM Vendor v WHERE v.approved = true AND v.blocked = false AND v.category.id = :categoryId ORDER BY v.rating DESC")
    List<Vendor> findTopRatedVendorsByCategory(Long categoryId);

    @Query("SELECT v FROM Vendor v WHERE v.approved = true AND v.blocked = false AND v.category.id = :categoryId AND (v.servicePincodes IS NULL OR v.servicePincodes LIKE %:pincode%)")
    List<Vendor> findByCategoryAndPincode(Long categoryId, String pincode);

    @Query("SELECT v FROM Vendor v WHERE v.approved = true AND v.blocked = false AND (v.servicePincodes IS NULL OR v.servicePincodes LIKE %:pincode%)")
    List<Vendor> findByPincode(String pincode);
}
