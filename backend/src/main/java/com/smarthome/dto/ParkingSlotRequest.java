package com.smarthome.dto;

import lombok.Data;

@Data
public class ParkingSlotRequest {
    private String slotNumber;
    private String floor;
    private String slotType;
    private Double pricePerHour;
    private String location;
}
