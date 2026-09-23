package com.sayadi.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CatalogueRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String fileUrl;

    private String coverImageUrl;
}
