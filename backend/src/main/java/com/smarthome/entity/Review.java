package com.smarthome.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 1000)
    private String comment;

    // AI Sentiment Analysis fields
    private Double sentimentScore; // 0.0 to 1.0 confidence

    @Column(length = 20)
    private String sentimentLabel; // POSITIVE, NEUTRAL, NEGATIVE

    private Integer aiSuggestedRating; // AI suggested rating 1-5

    private Integer atsScore; // Automated Tracking Score (0-100)

    @Column(length = 2000)
    private String atsFeedback; // JSON or String containing the questions and answers

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
