package com.sayadi.ecommerce.controller;

import com.sayadi.ecommerce.dto.AddCartItemRequest;
import com.sayadi.ecommerce.dto.CartDto;
import com.sayadi.ecommerce.dto.UpdateCartItemRequest;
import com.sayadi.ecommerce.security.UserPrincipal;
import com.sayadi.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public CartDto getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return cartService.getCart(principal.getId());
    }

    @PostMapping("/items")
    public CartDto addItem(@AuthenticationPrincipal UserPrincipal principal,
                            @Valid @RequestBody AddCartItemRequest request) {
        return cartService.addItem(principal.getId(), request);
    }

    @PutMapping("/items/{itemId}")
    public CartDto updateItem(@AuthenticationPrincipal UserPrincipal principal,
                               @PathVariable Long itemId,
                               @Valid @RequestBody UpdateCartItemRequest request) {
        return cartService.updateItem(principal.getId(), itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public CartDto removeItem(@AuthenticationPrincipal UserPrincipal principal, @PathVariable Long itemId) {
        return cartService.removeItem(principal.getId(), itemId);
    }

    @DeleteMapping
    public CartDto clear(@AuthenticationPrincipal UserPrincipal principal) {
        return cartService.clear(principal.getId());
    }
}
