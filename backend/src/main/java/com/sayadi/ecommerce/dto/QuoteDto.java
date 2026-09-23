package com.sayadi.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String productName;
    private String message;
    private List<String> attachments;
    private Instant createdAt;
}
