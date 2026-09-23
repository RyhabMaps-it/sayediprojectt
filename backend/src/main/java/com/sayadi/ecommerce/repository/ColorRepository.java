package com.sayadi.ecommerce.repository;

import com.sayadi.ecommerce.domain.Color;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ColorRepository extends JpaRepository<Color, Long> {
    boolean existsByName(String name);
}
