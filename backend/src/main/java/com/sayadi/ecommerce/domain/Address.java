package com.sayadi.ecommerce.domain;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {
    private String fullName;
    private String line1;
    private String city;
    private String postalCode;
    private String country;
    private String phone;
}
