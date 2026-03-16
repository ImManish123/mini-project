package com.smarthome.service;

import com.smarthome.dto.VendorRequest;
import com.smarthome.entity.ServiceCategory;
import com.smarthome.entity.Vendor;
import com.smarthome.entity.Booking;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.BookingRepository;
import com.smarthome.repository.ServiceCategoryRepository;
import com.smarthome.repository.VendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VendorService {

    private final VendorRepository vendorRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final BookingRepository bookingRepository;

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public List<Vendor> getApprovedVendors() {
        return vendorRepository.findByApprovedTrueAndBlockedFalse();
    }

    public List<Vendor> getVendorsByCategory(Long categoryId) {
        return vendorRepository.findByCategoryIdAndApprovedTrueAndBlockedFalse(categoryId);
    }

    public List<Vendor> getVendorsByCategoryAndPincode(Long categoryId, String pincode) {
        return vendorRepository.findByCategoryAndPincode(categoryId, pincode);
    }

    public List<Vendor> getVendorsByPincode(String pincode) {
        return vendorRepository.findByPincode(pincode);
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
    }

    @Transactional
    public Vendor createVendor(VendorRequest request) {
        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Vendor vendor = Vendor.builder()
                .name(request.getName())
                .category(category)
                .experienceYears(request.getExperienceYears())
                .price(request.getPrice())
                .phone(request.getPhone())
                .email(request.getEmail())
                .description(request.getDescription())
                .serviceArea(request.getServiceArea())
                .profileImage(request.getProfileImage())
                .rating(0.0)
                .totalReviews(0)
                .availabilityStatus(true)
                .approved(false)
                .blocked(false)
                .build();

        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor updateVendor(Long id, VendorRequest request) {
        Vendor vendor = getVendorById(id);
        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        vendor.setName(request.getName());
        vendor.setCategory(category);
        vendor.setExperienceYears(request.getExperienceYears());
        vendor.setPrice(request.getPrice());
        vendor.setPhone(request.getPhone());
        vendor.setEmail(request.getEmail());
        vendor.setDescription(request.getDescription());
        vendor.setServiceArea(request.getServiceArea());
        if (request.getProfileImage() != null) {
            vendor.setProfileImage(request.getProfileImage());
        }
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor approveVendor(Long id) {
        Vendor vendor = getVendorById(id);
        vendor.setApproved(true);
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor blockVendor(Long id) {
        Vendor vendor = getVendorById(id);
        vendor.setBlocked(!vendor.getBlocked());
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor toggleAvailability(Long id) {
        Vendor vendor = getVendorById(id);
        vendor.setAvailabilityStatus(!vendor.getAvailabilityStatus());
        return vendorRepository.save(vendor);
    }

    @Transactional
    public void deleteVendor(Long id) {
        vendorRepository.deleteById(id);
    }

    public List<Vendor> getTopRatedVendors() {
        return vendorRepository.findTopRatedVendors();
    }

    public long countActiveVendors() {
        return vendorRepository.countByApprovedTrue();
    }

    public long countAllVendors() {
        return vendorRepository.count();
    }

    public List<String> getAvailableTimeSlots(Long vendorId, String date) {
        // Standard time slots
        List<String> allSlots = Arrays.asList(
                "09:00 AM - 10:00 AM",
                "10:00 AM - 11:00 AM",
                "11:00 AM - 12:00 PM",
                "12:00 PM - 01:00 PM",
                "02:00 PM - 03:00 PM",
                "03:00 PM - 04:00 PM",
                "04:00 PM - 05:00 PM",
                "05:00 PM - 06:00 PM"
        );

        // Filter out already booked slots
        LocalDate bookingDate = LocalDate.parse(date);
        List<Booking> existingBookings = bookingRepository.findActiveBookingsByVendorAndDate(vendorId, bookingDate);
        Set<String> bookedSlots = existingBookings.stream()
                .map(Booking::getTimeSlot)
                .collect(Collectors.toSet());

        return allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());
    }
}
