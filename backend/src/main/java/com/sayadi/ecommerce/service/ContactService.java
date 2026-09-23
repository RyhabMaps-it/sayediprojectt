package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.dto.ContactRequest;
import com.sayadi.ecommerce.mapper.ContactMapper;
import com.sayadi.ecommerce.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;
    private final ContactMapper contactMapper;

    public void submit(ContactRequest request) {
        contactMessageRepository.save(contactMapper.toEntity(request));
    }
}
