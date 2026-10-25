package com.ecommerce.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.UUID;

@Builder
public record CreateOrderItemRequest(
        @NotNull UUID productId,
        @NotBlank String productName,
        @NotNull BigDecimal unitPrice,
        @Min(1) int quantity
) {}
