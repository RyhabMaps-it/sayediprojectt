package com.sayadi.ecommerce.repository;

import com.sayadi.ecommerce.domain.Collaboration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollaborationRepository extends JpaRepository<Collaboration, Long> {
    List<Collaboration> findByUserIdOrderByCreatedAtDesc(Long userId);
}
