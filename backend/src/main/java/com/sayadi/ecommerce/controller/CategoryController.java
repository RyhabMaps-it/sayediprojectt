package com.sayadi.ecommerce.controller;

import com.sayadi.ecommerce.dto.CategoryDto;
import com.sayadi.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public List<CategoryDto> findAll() {
        return categoryService.findAll();
    }

    @GetMapping("/{slug}")
    public CategoryDto findBySlug(@PathVariable String slug) {
        return categoryService.findBySlug(slug);
    }
}
