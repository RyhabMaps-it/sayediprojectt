package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Appointment;
import com.sayadi.ecommerce.dto.AppointmentDto;
import com.sayadi.ecommerce.dto.AppointmentRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class AppointmentMapper {

    public Appointment toEntity(AppointmentRequest request) {
        return Appointment.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .date(request.getDate())
                .time(request.getTime())
                .message(request.getMessage())
                .attachments(request.getAttachments() == null ? new ArrayList<>() : new ArrayList<>(request.getAttachments()))
                .build();
    }

    public AppointmentDto toDto(Appointment appointment) {
        return AppointmentDto.builder()
                .id(appointment.getId())
                .name(appointment.getName())
                .email(appointment.getEmail())
                .phone(appointment.getPhone())
                .date(appointment.getDate())
                .time(appointment.getTime())
                .message(appointment.getMessage())
                .status(appointment.getStatus())
                .attachments(new ArrayList<>(appointment.getAttachments()))
                .build();
    }
}
