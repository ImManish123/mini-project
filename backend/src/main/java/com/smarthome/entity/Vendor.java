package com.smarthome.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    private Integer experienceYears;

    @Builder.Default
    @Column(nullable = false)
    private Double rating = 0.0;

    @Builder.Default
    private Integer totalReviews = 0;

    @Column(nullable = false)
    private Double price;

    private String phone;

    private String email;

    private String profileImage;

    @Column(length = 500)
    private String description;

    private String serviceArea;

    @Column(length = 500)
    private String servicePincodes; // Comma-separated pincodes e.g. "600001,600002,600003"

    @Builder.Default
    @Column(nullable = false)
    private Boolean availabilityStatus = true;

    @Builder.Default
    @Column(nullable = false)
    private Boolean approved = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean blocked = false;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to check if vendor serves a pincode
    public boolean servesPincode(String pincode) {
        if (servicePincodes == null || servicePincodes.isEmpty() || pincode == null) {
            return true; // If no pincodes specified, serve all areas
        }
        String[] pincodes = servicePincodes.split(",");
        for (String p : pincodes) {
            if (p.trim().equals(pincode.trim())) {
                return true;
            }
        }
        return false;
    }
}
