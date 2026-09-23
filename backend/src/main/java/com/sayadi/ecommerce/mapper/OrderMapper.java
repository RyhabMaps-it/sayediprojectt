package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Address;
import com.sayadi.ecommerce.domain.CartItem;
import com.sayadi.ecommerce.domain.Order;
import com.sayadi.ecommerce.domain.OrderItem;
import com.sayadi.ecommerce.dto.CheckoutRequest;
import com.sayadi.ecommerce.dto.OrderDto;
import com.sayadi.ecommerce.dto.OrderItemDto;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class OrderMapper {

    public Address toAddress(CheckoutRequest.ShippingAddressRequest request) {
        return Address.builder()
                .fullName(request.getFullName())
                .line1(request.getLine1())
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .phone(request.getPhone())
                .build();
    }

    public OrderItem toOrderItem(Order order, CartItem cartItem) {
        BigDecimal subtotal = cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        return OrderItem.builder()
                .order(order)
                .product(cartItem.getProduct())
                .color(cartItem.getColor())
                .productName(cartItem.getProduct().getName())
                .colorName(cartItem.getColor() != null ? cartItem.getColor().getName() : null)
                .quantity(cartItem.getQuantity())
                .unitPrice(cartItem.getUnitPrice())
                .subtotal(subtotal)
                .build();
    }

    public OrderDto toDto(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems().stream().map(this::toItemDto).toList())
                .createdAt(order.getCreatedAt())
                .build();
    }

    public OrderItemDto toItemDto(OrderItem item) {
        return OrderItemDto.builder()
                .productName(item.getProductName())
                .colorName(item.getColorName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .subtotal(item.getSubtotal())
                .build();
    }
}
