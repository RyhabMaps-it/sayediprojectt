package com.sayadi.ecommerce.mapper;

import com.sayadi.ecommerce.domain.Role;
import com.sayadi.ecommerce.domain.User;
import com.sayadi.ecommerce.dto.auth.AuthResponse;
import com.sayadi.ecommerce.dto.auth.RegisterRequest;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AuthMapper {

    public User toEntity(RegisterRequest request, String encodedPassword) {
        return User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(encodedPassword)
                .phone(request.getPhone())
                .roles(Set.of(Role.ROLE_USER))
                .build();
    }

    public AuthResponse toAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .build();
    }
}
