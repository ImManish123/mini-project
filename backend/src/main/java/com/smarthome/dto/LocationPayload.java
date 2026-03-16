package com.smarthome.dto;

import lombok.Data;

@Data
public class LocationPayload {
    private Long bookingId;
    private Double latitude;
    private Double longitude;
}
