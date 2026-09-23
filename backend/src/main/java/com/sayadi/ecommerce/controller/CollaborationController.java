package com.sayadi.ecommerce.controller;

import com.sayadi.ecommerce.dto.CollaborationDto;
import com.sayadi.ecommerce.dto.CollaborationRequest;
import com.sayadi.ecommerce.security.UserPrincipal;
import com.sayadi.ecommerce.service.CollaborationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collaborations")
@RequiredArgsConstructor
public class CollaborationController {

    private final CollaborationService collaborationService;

    @PostMapping
    public ResponseEntity<CollaborationDto> submit(@AuthenticationPrincipal UserPrincipal principal,
                                                     @Valid @RequestBody CollaborationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(collaborationService.submit(principal.getId(), request));
    }

    @GetMapping("/me")
    public List<CollaborationDto> findMine(@AuthenticationPrincipal UserPrincipal principal) {
        return collaborationService.findMine(principal.getId());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<CollaborationDto> findAll() {
        return collaborationService.findAll();
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('ADMIN')")
    public CollaborationDto accept(@PathVariable Long id) {
        return collaborationService.accept(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        collaborationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
