package com.ecommerce.product.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
public record ProductResponse(
        UUID id,
        String sku,
        String name,
        String description,
        BigDecimal price,
        String currency,
        String category,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
