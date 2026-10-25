package com.ecommerce.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.UUID;

@Builder
public record SetStockRequest(
        @NotNull UUID productId,
        @Min(0) int quantity
) {}
