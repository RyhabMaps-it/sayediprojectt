package com.sayadi.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
public class ProductRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Long categoryId;

    private String material;
    private String heightCm;
    private String widthCm;
    private String depthCm;
    private String colorOptions;
    private String units;
    private Set<Long> colorIds;
    private BigDecimal price;
    private boolean priceOnRequest = true;
    private boolean hasTechnicalSheet = false;
    private String sku;
    private int stockQuantity = 0;
    private List<String> images;
}
