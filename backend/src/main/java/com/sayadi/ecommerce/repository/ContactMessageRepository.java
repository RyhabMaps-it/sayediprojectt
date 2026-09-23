package com.sayadi.ecommerce.repository;

import com.sayadi.ecommerce.domain.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
}
