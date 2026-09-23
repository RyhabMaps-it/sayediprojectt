package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Product;
import com.sayadi.ecommerce.domain.QuoteRequest;
import com.sayadi.ecommerce.dto.QuoteDto;
import com.sayadi.ecommerce.dto.QuoteRequestDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class QuoteMapper {

    public QuoteRequest toEntity(QuoteRequestDto request, Product product) {
        return QuoteRequest.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .subject(request.getSubject())
                .product(product)
                .message(request.getMessage())
                .attachments(request.getAttachments() == null ? new ArrayList<>() : new ArrayList<>(request.getAttachments()))
                .build();
    }

    public QuoteDto toDto(QuoteRequest quote) {
        return QuoteDto.builder()
                .id(quote.getId())
                .name(quote.getName())
                .email(quote.getEmail())
                .phone(quote.getPhone())
                .subject(quote.getSubject())
                .productName(quote.getProduct() != null ? quote.getProduct().getName() : null)
                .message(quote.getMessage())
                .attachments(new ArrayList<>(quote.getAttachments()))
                .createdAt(quote.getCreatedAt())
                .build();
    }
}
