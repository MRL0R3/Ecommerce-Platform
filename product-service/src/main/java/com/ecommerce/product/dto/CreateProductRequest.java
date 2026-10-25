package com.ecommerce.product.dto;

import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record CreateProductRequest(
        @NotBlank String sku,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 2000) String description,
        @NotNull @DecimalMin(value = "0.0001") BigDecimal price,
        @NotBlank @Size(max = 3) String currency,
        @NotBlank String category
) {}
