package com.sayadi.ecommerce.dto;

import com.sayadi.ecommerce.domain.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private LocalDate date;
    private String time;
    private String message;
    private AppointmentStatus status;
    private List<String> attachments;
}
