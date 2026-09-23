package com.sayadi.ecommerce.service;

import com.sayadi.ecommerce.domain.Cart;
import com.sayadi.ecommerce.domain.User;
import com.sayadi.ecommerce.dto.auth.AuthResponse;
import com.sayadi.ecommerce.dto.auth.LoginRequest;
import com.sayadi.ecommerce.dto.auth.RegisterRequest;
import com.sayadi.ecommerce.exception.BadRequestException;
import com.sayadi.ecommerce.mapper.AuthMapper;
import com.sayadi.ecommerce.repository.CartRepository;
import com.sayadi.ecommerce.repository.UserRepository;
import com.sayadi.ecommerce.security.JwtService;
import com.sayadi.ecommerce.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthMapper authMapper;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Un compte existe déjà avec cet email");
        }

        User user = authMapper.toEntity(request, passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        Cart cart = Cart.builder().user(user).build();
        cartRepository.save(cart);

        String token = jwtService.generateToken(new UserPrincipal(user));
        return authMapper.toAuthResponse(user, token);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Email ou mot de passe incorrect"));

        String token = jwtService.generateToken(new UserPrincipal(user));
        return authMapper.toAuthResponse(user, token);
    }
}
