package com.smarthome.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotBlank(message = "Time slot is required")
    private String timeSlot;

    private String serviceAddress;
    private String servicePincode; // Customer's service location pincode
    private String notes;
    private String paymentMethod; // ONLINE or CASH_ON_SERVICE
}
