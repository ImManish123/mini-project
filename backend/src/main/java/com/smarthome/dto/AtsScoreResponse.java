package com.smarthome.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AtsScoreResponse {
    private Integer atsScore;
    private String explanation;
}

