package com.ecommerce.order.dto;

import lombok.Builder;

import java.util.UUID;

/**
 * Local DTO mirroring the Inventory Service's StockResponse.
 * Kept here (not imported from inventory-service) so the Order Service has no
 * compile-time dependency on another service's jar (loose coupling).
 */
@Builder
public record InventoryStockResponse(
        UUID productId,
        int quantity,
        int reserved,
        int available
) {}
