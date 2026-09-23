package com.sayadi.ecommerce.repository;

import com.sayadi.ecommerce.domain.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartIdAndProductIdAndColorId(Long cartId, Long productId, Long colorId);

    Optional<CartItem> findByCartIdAndProductIdAndColorIsNull(Long cartId, Long productId);
}
