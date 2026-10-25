package com.ecommerce.inventory.controller;

import com.ecommerce.inventory.dto.*;
import com.ecommerce.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Inventory", description = "Stock level management")
@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService service;

    @Operation(summary = "List all inventory items")
    @GetMapping
    public java.util.List<StockResponse> listAll() {
        return service.listAll();
    }

    @Operation(summary = "Get stock for multiple products in bulk")
    @GetMapping("/bulk")
    public java.util.List<StockResponse> getBulkStock(@RequestParam java.util.List<UUID> productIds) {
        return service.getBulkStock(productIds);
    }

    @Operation(summary = "Get stock for a product")
    @GetMapping("/{productId}")
    public StockResponse getStock(@PathVariable UUID productId) {
        return service.getStock(productId);
    }

    @Operation(summary = "Set stock for a product (admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{productId}")
    public StockResponse setStock(@PathVariable UUID productId,
                                  @Valid @RequestBody SetStockRequest request) {
        // Force path id to match body id to avoid ambiguity
        if (!productId.equals(request.productId())) {
            request = new SetStockRequest(productId, request.quantity());
        }
        return service.setStock(request);
    }

    /**
     * Internal endpoint called by the Order Service (via Feign) to reserve stock.
     */
    @Operation(summary = "Reserve stock for an order (internal)", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{productId}/reserve")
    @ResponseStatus(HttpStatus.OK)
    public StockResponse reserve(@PathVariable UUID productId,
                                 @Valid @RequestBody ReduceStockRequest request) {
        return service.reserve(productId, request.quantity());
    }

    @Operation(summary = "Deduct stock (internal, after fulfillment)", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping("/{productId}/deduct")
    public StockResponse deduct(@PathVariable UUID productId,
                                @Valid @RequestBody ReduceStockRequest request) {
        return service.deduct(productId, request.quantity());
    }
}
