package com.sayadi.ecommerce.dto;

import com.sayadi.ecommerce.domain.CollaborationStatus;
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
public class CollaborationDto {
    private Long id;
    private String phone;
    private String message;
    private String userEmail;
    private String userFullName;
    private CollaborationStatus status;
    private List<String> attachments;
    private Instant createdAt;
}
