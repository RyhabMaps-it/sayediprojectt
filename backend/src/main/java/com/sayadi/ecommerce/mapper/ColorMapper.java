package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Color;
import com.sayadi.ecommerce.dto.ColorDto;
import com.sayadi.ecommerce.dto.ColorRequest;
import org.springframework.stereotype.Component;

@Component
public class ColorMapper {

    public ColorDto toDto(Color color) {
        return ColorDto.builder()
                .id(color.getId())
                .name(color.getName())
                .code(color.getCode())
                .imageUrl(color.getImageUrl())
                .build();
    }

    public Color toEntity(ColorRequest request) {
        return Color.builder()
                .name(request.getName())
                .code(request.getCode())
                .imageUrl(request.getImageUrl())
                .build();
    }
}
