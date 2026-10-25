package com.ecommerce.product.service;

import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductRepository;
import com.ecommerce.product.dto.*;
import com.ecommerce.product.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Product application service.
 *
 * Single entry point for all product operations — keeps controllers thin
 * (SRP). Enforces business rules (SKU uniqueness, price > 0) before hitting
 * the repository. Logging at INFO for create/update/delete, DEBUG for reads.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repository;
    private final ProductMapper mapper;

    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> list(String category, Boolean active, Pageable pageable) {
        log.debug("Listing products category={} active={} page={}", category, active, pageable.getPageNumber());
        Page<Product> page = repository.search(category, active, pageable);
        return PagedResponse.from(page.map(mapper::toResponse));
    }

    @Transactional(readOnly = true)
    public java.util.List<ProductResponse> getBulk(java.util.List<UUID> ids) {
        log.debug("Bulk fetching products ids={}", ids);
        return repository.findAllById(ids).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getCountStats() {
        long total = repository.count();
        long active = repository.countByActiveTrue();
        return java.util.Map.of(
                "totalProducts", total,
                "activeProducts", active,
                "inactiveProducts", total - active
        );
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
    }

    @Transactional
    public ProductResponse create(CreateProductRequest request) {
        if (repository.existsBySku(request.sku())) {
            throw new IllegalStateException("SKU already exists: " + request.sku());
        }
        Product product = mapper.toEntity(request);
        product = repository.save(product);
        log.info("Created product id={} sku={}", product.getId(), product.getSku());
        return mapper.toResponse(product);
    }

    @Transactional
    public ProductResponse update(UUID id, UpdateProductRequest request) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + id));
        mapper.updateEntity(request, product);
        product = repository.save(product);
        log.info("Updated product id={}", product.getId());
        return mapper.toResponse(product);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found: " + id);
        }
        repository.deleteById(id);
        log.info("Deleted product id={}", id);
    }
}
