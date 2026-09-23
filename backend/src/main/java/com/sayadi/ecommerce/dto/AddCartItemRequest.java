package com.sayadi.ecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddCartItemRequest {

    @NotNull
    private Long productId;

    private Long colorId;

    @Min(1)
    private int quantity = 1;
}
