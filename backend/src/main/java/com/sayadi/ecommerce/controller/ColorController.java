package com.sayadi.ecommerce.controller;

import com.sayadi.ecommerce.dto.ColorDto;
import com.sayadi.ecommerce.dto.ColorRequest;
import com.sayadi.ecommerce.service.ColorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/colors")
@RequiredArgsConstructor
public class ColorController {

    private final ColorService colorService;

    @GetMapping
    public List<ColorDto> findAll() {
        return colorService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ColorDto> create(@Valid @RequestBody ColorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(colorService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        colorService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
