package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.ContactMessage;
import com.sayadi.ecommerce.dto.ContactRequest;
import org.springframework.stereotype.Component;

@Component
public class ContactMapper {

    public ContactMessage toEntity(ContactRequest request) {
        return ContactMessage.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .subject(request.getSubject())
                .message(request.getMessage())
                .build();
    }
}
