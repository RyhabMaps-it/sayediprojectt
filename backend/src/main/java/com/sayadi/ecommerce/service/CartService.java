package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Cart;
import com.sayadi.ecommerce.domain.CartItem;
import com.sayadi.ecommerce.domain.Color;
import com.sayadi.ecommerce.domain.Product;
import com.sayadi.ecommerce.domain.Role;
import com.sayadi.ecommerce.domain.User;
import com.sayadi.ecommerce.dto.AddCartItemRequest;
import com.sayadi.ecommerce.dto.CartDto;
import com.sayadi.ecommerce.dto.UpdateCartItemRequest;
import com.sayadi.ecommerce.exception.BadRequestException;
import com.sayadi.ecommerce.exception.ResourceNotFoundException;
import com.sayadi.ecommerce.mapper.CartMapper;
import com.sayadi.ecommerce.repository.CartItemRepository;
import com.sayadi.ecommerce.repository.CartRepository;
import com.sayadi.ecommerce.repository.ColorRepository;
import com.sayadi.ecommerce.repository.ProductRepository;
import com.sayadi.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class CartService {

    private static final BigDecimal ARCHITECT_DISCOUNT_RATE = new BigDecimal("0.15");

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ColorRepository colorRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;

    @Transactional
    public CartDto getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toDto(cart);
    }

    @Transactional
    public CartDto addItem(Long userId, AddCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Produit introuvable"));

        if (product.isPriceOnRequest() || product.getPrice() == null) {
            throw new BadRequestException("Ce produit est disponible sur devis, contactez-nous pour l'ajouter à une commande");
        }

        Color color = null;
        if (request.getColorId() != null) {
            color = colorRepository.findById(request.getColorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Couleur introuvable"));
        }

        BigDecimal unitPrice = applyArchitectDiscountIfEligible(userId, product.getPrice());

        CartItem item = (color != null
                ? cartItemRepository.findByCartIdAndProductIdAndColorId(cart.getId(), product.getId(), color.getId())
                : cartItemRepository.findByCartIdAndProductIdAndColorIsNull(cart.getId(), product.getId()))
                .orElse(null);

        if (item == null) {
            item = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .color(color)
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .build();
            cart.getItems().add(item);
        } else {
            item.setQuantity(item.getQuantity() + request.getQuantity());
        }

        cartRepository.save(cart);
        return cartMapper.toDto(cart);
    }

    @Transactional
    public CartDto updateItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Article introuvable dans le panier"));

        item.setQuantity(request.getQuantity());
        cartRepository.save(cart);
        return cartMapper.toDto(cart);
    }

    @Transactional
    public CartDto removeItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        boolean removed = cart.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new ResourceNotFoundException("Article introuvable dans le panier");
        }
        cartRepository.save(cart);
        return cartMapper.toDto(cart);
    }

    @Transactional
    public CartDto clear(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().clear();
        cartRepository.save(cart);
        return cartMapper.toDto(cart);
    }

    protected Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    throw new ResourceNotFoundException("Panier introuvable pour cet utilisateur");
                });
    }

    private BigDecimal applyArchitectDiscountIfEligible(Long userId, BigDecimal price) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (!user.getRoles().contains(Role.ROLE_ARCHITECT)) {
            return price;
        }
        BigDecimal discount = price.multiply(ARCHITECT_DISCOUNT_RATE);
        return price.subtract(discount).setScale(2, RoundingMode.HALF_UP);
    }
}
