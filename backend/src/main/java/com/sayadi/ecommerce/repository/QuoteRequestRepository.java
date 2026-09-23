package com.sayadi.ecommerce.repository;

import com.sayadi.ecommerce.domain.QuoteRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuoteRequestRepository extends JpaRepository<QuoteRequest, Long> {
}
