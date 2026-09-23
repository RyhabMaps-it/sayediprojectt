package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Appointment;
import com.sayadi.ecommerce.dto.AppointmentDto;
import com.sayadi.ecommerce.dto.AppointmentRequest;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.AppointmentMapper;
import com.sayadi.ecommerce.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentMapper appointmentMapper;

    public AppointmentDto submit(AppointmentRequest request) {
        Appointment appointment = appointmentMapper.toEntity(request);
        return appointmentMapper.toDto(appointmentRepository.save(appointment));
    }

    public List<AppointmentDto> findAll() {
        return appointmentRepository.findAll().stream().map(appointmentMapper::toDto).toList();
    }

    public void delete(Long id) {
        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Rendez-vous introuvable");
        }
        appointmentRepository.deleteById(id);
    }
}
