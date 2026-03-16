package com.smarthome.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VendorRequest {
    @NotBlank(message = "Vendor name is required")
    private String name;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    private Integer experienceYears;

    @NotNull(message = "Price is required")
    private Double price;

    private String phone;
    private String email;
    private String description;
    private String serviceArea;
    private String profileImage;
}
