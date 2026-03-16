package com.smarthome.service;

import com.smarthome.dto.ReviewRequest;
import com.smarthome.entity.*;
import com.smarthome.exception.BadRequestException;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final BookingRepository bookingRepository;

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getReviewsByVendor(Long vendorId) {
        return reviewRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
    }

    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserId(userId);
    }

    @Transactional
    public Review createReview(Long userId, ReviewRequest request) {
        // Check if already reviewed
        if (reviewRepository.existsByUserIdAndBookingId(userId, request.getBookingId())) {
            throw new BadRequestException("You have already reviewed this booking");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found"));
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new BadRequestException("Can only review completed bookings");
        }

        Review review = Review.builder()
                .user(user)
                .vendor(vendor)
                .booking(booking)
                .rating(request.getRating())
                .comment(request.getComment())
                .sentimentScore(request.getSentimentScore())
                .sentimentLabel(request.getSentimentLabel())
                .aiSuggestedRating(request.getAiSuggestedRating())
                .atsScore(request.getAtsScore())
                .atsFeedback(request.getAtsFeedback())
                .build();

        Review savedReview = reviewRepository.save(review);

        // Update vendor rating
        updateVendorRating(vendor);

        return savedReview;
    }

    public List<Review> getTopRatedReviews() {
        List<Review> reviews = reviewRepository.findTopRatedReviews();
        return reviews.size() > 6 ? reviews.subList(0, 6) : reviews;
    }

    public List<Review> getTopAtsReviews() {
        List<Review> reviews = reviewRepository.findTopAtsReviews();
        return reviews.size() > 6 ? reviews.subList(0, 6) : reviews;
    }

    @Transactional
    public void deleteReview(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + id));
        Vendor vendor = review.getVendor();
        reviewRepository.deleteById(id);
        // Recalculate vendor rating after deletion
        updateVendorRating(vendor);
    }

    private void updateVendorRating(Vendor vendor) {
        Double avgRating = reviewRepository.getAverageRatingByVendorId(vendor.getId());
        long reviewCount = reviewRepository.countByVendorId(vendor.getId());
        vendor.setRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        vendor.setTotalReviews((int) reviewCount);
        vendorRepository.save(vendor);
    }
}

