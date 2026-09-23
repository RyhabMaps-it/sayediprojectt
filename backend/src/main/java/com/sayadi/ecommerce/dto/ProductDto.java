package com.sayadi.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String categoryName;
    private String categorySlug;
    private String material;
    private String heightCm;
    private String widthCm;
    private String depthCm;
    private String colorOptions;
    private String units;
    private Set<ColorDto> colors;
    private BigDecimal price;
    private boolean priceOnRequest;
    private boolean hasTechnicalSheet;
    private String sku;
    private int stockQuantity;
    private List<String> images;
}
