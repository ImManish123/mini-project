package com.smarthome.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parking_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slotNumber;

    @Column(nullable = false)
    private String floor;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotType slotType = SlotType.FOUR_WHEELER;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParkingSlotStatus status = ParkingSlotStatus.AVAILABLE;

    @Column(nullable = false)
    private Double pricePerHour;

    @Column(length = 500)
    private String location;

    // Flat/Unit number this slot is allocated to (for resident allocated slots)
    @Column(length = 50)
    private String flatNumber;

    // Resident this slot is permanently allocated to
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "allocated_to_user_id")
    private User allocatedToUser;

    // Whether this is an allocated slot (1 per home) vs additional bookable slot
    @Builder.Default
    @Column(nullable = false)
    private Boolean isAllocated = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean active = true;

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
}
