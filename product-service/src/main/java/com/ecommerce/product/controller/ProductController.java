package com.ecommerce.product.controller;

import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.product.dto.*;
import com.ecommerce.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Products", description = "Product catalog management")
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService service;

    @Operation(summary = "List products (paginated, filterable)")
    @GetMapping
    public PagedResponse<ProductResponse> list(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean active,
            Pageable pageable) {
        return service.list(category, active, pageable);
    }

    @Operation(summary = "Get multiple products by IDs (bulk)")
    @GetMapping("/bulk")
    public java.util.List<ProductResponse> getBulk(@RequestParam java.util.List<UUID> ids) {
        return service.getBulk(ids);
    }

    @Operation(summary = "Get product count statistics")
    @GetMapping("/count")
    public java.util.Map<String, Object> getCountStats() {
        return service.getCountStats();
    }

    @Operation(summary = "Get a product by id")
    @GetMapping("/{id}")
    public ProductResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @Operation(summary = "Create a product (admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(@Valid @RequestBody CreateProductRequest request) {
        return service.create(request);
    }

    @Operation(summary = "Update a product (admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateProductRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Delete a product (admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
