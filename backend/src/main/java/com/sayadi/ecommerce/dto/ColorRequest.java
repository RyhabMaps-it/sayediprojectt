package com.sayadi.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ColorRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String code;

    private String imageUrl;
}
