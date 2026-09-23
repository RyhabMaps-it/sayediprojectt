package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Cart;
import com.sayadi.ecommerce.domain.CartItem;
import com.sayadi.ecommerce.domain.Order;
import com.sayadi.ecommerce.domain.OrderStatus;
import com.sayadi.ecommerce.dto.CheckoutRequest;
import com.sayadi.ecommerce.dto.OrderDto;
import com.sayadi.ecommerce.exception.BadRequestException;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.OrderMapper;
import com.sayadi.ecommerce.repository.CartRepository;
import com.sayadi.ecommerce.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderMapper orderMapper;

    @Transactional
    public OrderDto checkout(Long userId, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Panier introuvable"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Le panier est vide");
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(cart.getUser())
                .shippingAddress(orderMapper.toAddress(request.getShippingAddress()))
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            var orderItem = orderMapper.toOrderItem(order, cartItem);
            total = total.add(orderItem.getSubtotal());
            order.getItems().add(orderItem);
        }
        order.setTotalAmount(total);

        order = orderRepository.save(order);

        cart.getItems().clear();
        cartRepository.save(cart);

        return orderMapper.toDto(order);
    }

    public List<OrderDto> findMyOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(orderMapper::toDto).toList();
    }

    public OrderDto findByIdForUser(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Commande introuvable"));
        return orderMapper.toDto(order);
    }

    private String generateOrderNumber() {
        return "SYD-" + Instant.now().getEpochSecond() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
