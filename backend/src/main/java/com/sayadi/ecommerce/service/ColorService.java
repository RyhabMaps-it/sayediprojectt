package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Color;
import com.sayadi.ecommerce.dto.ColorDto;
import com.sayadi.ecommerce.dto.ColorRequest;
import com.sayadi.ecommerce.exception.BadRequestException;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.ColorMapper;
import com.sayadi.ecommerce.repository.ColorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ColorService {

    private final ColorRepository colorRepository;
    private final ColorMapper colorMapper;

    public List<ColorDto> findAll() {
        return colorRepository.findAll().stream().map(colorMapper::toDto).toList();
    }

    public ColorDto create(ColorRequest request) {
        if (colorRepository.existsByName(request.getName())) {
            throw new BadRequestException("Cette couleur existe déjà");
        }
        Color color = colorMapper.toEntity(request);
        return colorMapper.toDto(colorRepository.save(color));
    }

    public void delete(Long id) {
        if (!colorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Couleur introuvable");
        }
        colorRepository.deleteById(id);
    }
}
