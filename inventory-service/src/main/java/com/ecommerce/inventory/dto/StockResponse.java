package com.ecommerce.inventory.dto;

import lombok.Builder;

import java.util.UUID;

@Builder
public record StockResponse(
        UUID productId,
        int quantity,
        int reserved,
        int available
) {}
