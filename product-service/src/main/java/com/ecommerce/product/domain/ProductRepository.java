package com.ecommerce.product.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findBySku(String sku);
    boolean existsBySku(String sku);

    @Query("""
        SELECT p FROM Product p
        WHERE (:category IS NULL OR p.category = :category)
          AND (:active IS NULL OR p.active = :active)
        """)
    Page<Product> search(@Param("category") String category,
                         @Param("active") Boolean active,
                         Pageable pageable);
    long countByActiveTrue();
}
