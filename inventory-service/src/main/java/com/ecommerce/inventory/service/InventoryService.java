package com.ecommerce.inventory.service;

import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.inventory.domain.InventoryItem;
import com.ecommerce.inventory.domain.InventoryRepository;
import com.ecommerce.inventory.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Inventory application service. All mutations happen in a transaction with
 * optimistic locking (@Version on InventoryItem) so concurrent reservations
 * can't oversell.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository repository;

    @Transactional(readOnly = true)
    public java.util.List<StockResponse> listAll() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.List<StockResponse> getBulkStock(java.util.List<UUID> productIds) {
        return repository.findByProductIdIn(productIds).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockResponse getStock(UUID productId) {
        InventoryItem item = repository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory for product: " + productId));
        return toResponse(item);
    }

    @Transactional
    public StockResponse setStock(SetStockRequest request) {
        InventoryItem item = repository.findByProductId(request.productId())
                .orElseGet(() -> InventoryItem.builder()
                        .productId(request.productId())
                        .quantity(0)
                        .reserved(0)
                        .build());
        // Replace quantity directly (admin operation)
        item.setQuantity(request.quantity());
        item = repository.save(item);
        log.info("Set stock for product {} to {}", request.productId(), request.quantity());
        return toResponse(item);
    }

    /**
     * Reserve stock for a pending order. Called by the Order Service via Feign.
     * Returns the reserved quantity on success.
     */
    @Transactional
    public StockResponse reserve(UUID productId, int quantity) {
        InventoryItem item = repository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory for product: " + productId));
        item.reserve(quantity);
        item = repository.save(item);
        log.info("Reserved {} of product {} (available now: {})", quantity, productId, item.available());
        return toResponse(item);
    }

    /**
     * Deduct stock once the order is fulfilled. Releases the reservation first.
     */
    @Transactional
    public StockResponse deduct(UUID productId, int quantity) {
        InventoryItem item = repository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory for product: " + productId));
        item.deduct(quantity);
        item = repository.save(item);
        log.info("Deducted {} of product {} (remaining: {})", quantity, productId, item.getQuantity());
        return toResponse(item);
    }

    private StockResponse toResponse(InventoryItem item) {
        return StockResponse.builder()
                .productId(item.getProductId())
                .quantity(item.getQuantity())
                .reserved(item.getReserved())
                .available(item.available())
                .build();
    }
}
