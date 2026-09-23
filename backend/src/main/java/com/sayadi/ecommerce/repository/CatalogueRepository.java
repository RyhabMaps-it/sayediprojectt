package com.sayadi.ecommerce.repository;

import com.sayadi.ecommerce.domain.Catalogue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogueRepository extends JpaRepository<Catalogue, Long> {
    boolean existsByTitle(String title);
}
