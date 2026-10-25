package com.ecommerce.order.controller;

import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.order.dto.CreateOrderRequest;
import com.ecommerce.order.dto.OrderResponse;
import com.ecommerce.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Orders", description = "Customer order management")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @Operation(summary = "List orders (paginated, optional customerId)", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping
    public PagedResponse<OrderResponse> list(@RequestParam(required = false) UUID customerId, Pageable pageable) {
        if (customerId != null) {
            return service.listOrders(customerId, pageable);
        }
        return service.listAllOrders(pageable);
    }

    @Operation(summary = "Get order statistics (admin dashboard)", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/stats")
    public java.util.Map<String, Object> getStats() {
        return service.getStats();
    }

    @Operation(summary = "Get recent orders", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/recent")
    public java.util.List<OrderResponse> getRecent() {
        return service.getRecentOrders();
    }

    @Operation(summary = "Get an order by id", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @Operation(summary = "Place a new order (reserves stock via Inventory Service)",
            security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse create(@Valid @RequestBody CreateOrderRequest request) {
        return service.createOrder(request);
    }

    @Operation(summary = "Update order status", security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable UUID id, @Valid @RequestBody com.ecommerce.order.dto.UpdateOrderStatusRequest request) {
        return service.updateOrderStatus(id, request.status());
    }
}
