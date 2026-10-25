package com.ecommerce.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

import java.util.List;
import java.util.UUID;

@Builder
public record CreateOrderRequest(
        @NotNull UUID customerId,
        @NotEmpty @Valid List<CreateOrderItemRequest> items
) {}
