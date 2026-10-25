package com.ecommerce.order.client;

import com.ecommerce.order.dto.InventoryStockResponse;
import com.ecommerce.order.dto.ReduceStockRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

/**
 * Feign client for the Inventory Service.
 *
 * The name "INVENTORY-SERVICE" matches the spring.application.name registered
 * in Eureka — Feign resolves it at runtime, no hardcoded host/port needed.
 *
 * Resilience4j circuit breaker is configured on the calling side (OrderService)
 * via @CircuitBreaker — see OrderService.createOrder().
 */
@FeignClient(name = "INVENTORY-SERVICE")
public interface InventoryClient {

    @GetMapping("/api/v1/inventory/{productId}")
    InventoryStockResponse getStock(@PathVariable UUID productId);

    @PostMapping("/api/v1/inventory/{productId}/reserve")
    InventoryStockResponse reserve(@PathVariable UUID productId,
                                  @RequestBody ReduceStockRequest request);
}
