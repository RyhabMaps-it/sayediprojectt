package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Category;
import com.sayadi.ecommerce.dto.CategoryDto;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryDto toDto(Category category) {
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .build();
    }
}
