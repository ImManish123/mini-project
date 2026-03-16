package com.smarthome.dto;

import lombok.Data;

@Data
public class LiftBookingRequest {
    private String flatNumber;
    private String bookingDate;
    private String startTime;
    private String endTime;
    private String purpose;
    private Integer numberOfGuests;
    private String notes;
    private String paymentMethod;
}
