package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.dto.ReviewRequest;
import com.smarthome.dto.SentimentResponse;
import com.smarthome.entity.Review;
import com.smarthome.entity.User;
import com.smarthome.service.ReviewService;
import com.smarthome.service.SentimentAnalysisService;
import com.smarthome.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;
    private final SentimentAnalysisService sentimentAnalysisService;

    @GetMapping
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/top-rated")
    public ResponseEntity<List<Review>> getTopRatedReviews() {
        return ResponseEntity.ok(reviewService.getTopRatedReviews());
    }

    @GetMapping("/top-ats")
    public ResponseEntity<List<Review>> getTopAtsReviews() {
        return ResponseEntity.ok(reviewService.getTopAtsReviews());
    }

    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<Review>> getReviewsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(reviewService.getReviewsByVendor(vendorId));
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<Review>> getMyReviews(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(reviewService.getReviewsByUser(user.getId()));
    }

    @GetMapping("/ats-questions")
    public ResponseEntity<List<String>> getAtsQuestions(@RequestParam String category) {
        return ResponseEntity.ok(sentimentAnalysisService.generateAtsQuestions(category));
    }

    @PostMapping("/calculate-ats")
    public ResponseEntity<com.smarthome.dto.AtsScoreResponse> calculateAtsScore(@RequestBody Map<String, String> answers) {
        return ResponseEntity.ok(sentimentAnalysisService.calculateAtsScore(answers));
    }

    @PostMapping("/analyze-sentiment")
    public ResponseEntity<SentimentResponse> analyzeSentiment(@RequestBody Map<String, String> request) {
        String comment = request.get("comment");
        SentimentResponse response = sentimentAnalysisService.analyzeSentiment(comment);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Review> createReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(reviewService.createReview(user.getId(), request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteReview(@PathVariable Long id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully"));
    }
}


