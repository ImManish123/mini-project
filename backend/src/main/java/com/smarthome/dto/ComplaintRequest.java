package com.smarthome.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintRequest {
    private String title;
    private String description;
    private String category;
    private String location;
}
