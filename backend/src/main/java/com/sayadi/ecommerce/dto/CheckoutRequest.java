package com.sayadi.ecommerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {

    @NotNull
    @Valid
    private ShippingAddressRequest shippingAddress;

    @Data
    public static class ShippingAddressRequest {
        @NotBlank
        private String fullName;
        @NotBlank
        private String line1;
        @NotBlank
        private String city;
        @NotBlank
        private String postalCode;
        @NotBlank
        private String country;
        private String phone;
    }
}
