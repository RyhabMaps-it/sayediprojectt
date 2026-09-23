package com.sayadi.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productImage;
    private Long colorId;
    private String colorName;
    private String colorCode;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
