package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Cart;
import com.sayadi.ecommerce.domain.CartItem;
import com.sayadi.ecommerce.domain.Color;
import com.sayadi.ecommerce.domain.Product;
import com.sayadi.ecommerce.dto.CartDto;
import com.sayadi.ecommerce.dto.CartItemDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Comparator;

@Component
public class CartMapper {

    public CartDto toDto(Cart cart) {
        var items = cart.getItems().stream()
                .sorted(Comparator.comparing(CartItem::getId))
                .map(this::toItemDto)
                .toList();

        BigDecimal total = items.stream()
                .map(CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDto.builder()
                .id(cart.getId())
                .items(items)
                .total(total)
                .build();
    }

    public CartItemDto toItemDto(CartItem item) {
        Product product = item.getProduct();
        Color color = item.getColor();
        String image = product.getImages().isEmpty() ? null : product.getImages().get(0).getUrl();
        return CartItemDto.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .productImage(image)
                .colorId(color != null ? color.getId() : null)
                .colorName(color != null ? color.getName() : null)
                .colorCode(color != null ? color.getCode() : null)
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .build();
    }
}
