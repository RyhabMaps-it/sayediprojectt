package com.sayadi.ecommerce.controller;

import com.sayadi.ecommerce.dto.CheckoutRequest;
import com.sayadi.ecommerce.dto.OrderDto;
import com.sayadi.ecommerce.security.UserPrincipal;
import com.sayadi.ecommerce.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderDto> checkout(@AuthenticationPrincipal UserPrincipal principal,
                                              @Valid @RequestBody CheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.checkout(principal.getId(), request));
    }

    @GetMapping
    public List<OrderDto> myOrders(@AuthenticationPrincipal UserPrincipal principal) {
        return orderService.findMyOrders(principal.getId());
    }

    @GetMapping("/{id}")
    public OrderDto findOne(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long id) {
        return orderService.findByIdForUser(principal.getId(), id);
    }
}
