package com.smarthome.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewRequest {
    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;

    private String comment;

    // AI Sentiment fields (optional, from frontend AI analysis)
    private Double sentimentScore;
    private String sentimentLabel;
    private Integer aiSuggestedRating;
    
    private Integer atsScore;
    private String atsFeedback;
}
