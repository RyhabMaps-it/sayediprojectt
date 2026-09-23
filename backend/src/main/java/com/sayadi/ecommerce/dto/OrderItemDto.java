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
public class OrderItemDto {
    private String productName;
    private String colorName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
