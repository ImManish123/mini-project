package com.smarthome.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SentimentResponse {
    private int suggestedRating; // 1-5 star rating
    private String sentimentLabel; // POSITIVE, NEUTRAL, NEGATIVE
    private double sentimentScore; // 0.0 to 1.0 confidence
    private String explanation; // Brief AI explanation
}
