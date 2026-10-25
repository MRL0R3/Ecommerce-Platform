package com.ecommerce.inventory.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository extends JpaRepository<InventoryItem, UUID> {
    Optional<InventoryItem> findByProductId(UUID productId);
    boolean existsByProductId(UUID productId);
    java.util.List<InventoryItem> findByProductIdIn(java.util.Collection<UUID> productIds);
}
