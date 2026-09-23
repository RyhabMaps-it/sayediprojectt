package com.sayadi.ecommerce.controller;

import com.sayadi.ecommerce.dto.CatalogueDto;
import com.sayadi.ecommerce.dto.CatalogueRequest;
import com.sayadi.ecommerce.service.CatalogueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogues")
@RequiredArgsConstructor
public class CatalogueController {

    private final CatalogueService catalogueService;

    @GetMapping
    public List<CatalogueDto> findAll() {
        return catalogueService.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CatalogueDto> create(@Valid @RequestBody CatalogueRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogueService.create(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        catalogueService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
