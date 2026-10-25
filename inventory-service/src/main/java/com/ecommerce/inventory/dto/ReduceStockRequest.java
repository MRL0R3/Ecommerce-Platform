package com.ecommerce.inventory.dto;

import jakarta.validation.constraints.Min;
import lombok.Builder;

@Builder
public record ReduceStockRequest(
        @Min(1) int quantity
) {}
