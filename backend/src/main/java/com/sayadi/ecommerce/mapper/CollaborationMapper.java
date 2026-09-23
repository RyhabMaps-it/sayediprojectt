package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Collaboration;
import com.sayadi.ecommerce.domain.User;
import com.sayadi.ecommerce.dto.CollaborationDto;
import com.sayadi.ecommerce.dto.CollaborationRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class CollaborationMapper {

    public Collaboration toEntity(CollaborationRequest request, User user) {
        return Collaboration.builder()
                .phone(request.getPhone())
                .message(request.getMessage())
                .user(user)
                .attachments(request.getAttachments() == null ? new ArrayList<>() : new ArrayList<>(request.getAttachments()))
                .build();
    }

    public CollaborationDto toDto(Collaboration collaboration) {
        User user = collaboration.getUser();
        return CollaborationDto.builder()
                .id(collaboration.getId())
                .phone(collaboration.getPhone())
                .message(collaboration.getMessage())
                .userEmail(user.getEmail())
                .userFullName(user.getFirstName() + " " + user.getLastName())
                .status(collaboration.getStatus())
                .attachments(new ArrayList<>(collaboration.getAttachments()))
                .createdAt(collaboration.getCreatedAt())
                .build();
    }
}
