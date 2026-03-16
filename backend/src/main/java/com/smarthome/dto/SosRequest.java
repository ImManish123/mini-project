package com.smarthome.dto;

import lombok.Data;

@Data
public class SosRequest {
    private String sosType;
    private String location;
    private String description;
}
