package com.ecommerce.order.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Builder
public record OrderResponse(
        UUID id,
        UUID customerId,
        BigDecimal totalAmount,
        String status,
        List<OrderItemResponse> items,
        Instant createdAt,
        Instant updatedAt
) {}
