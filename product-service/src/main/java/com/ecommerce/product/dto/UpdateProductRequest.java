package com.ecommerce.product.dto;

import jakarta.validation.constraints.*;
import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record UpdateProductRequest(
        @Size(max = 255) String name,
        @Size(max = 2000) String description,
        @DecimalMin(value = "0.0001") BigDecimal price,
        @Size(max = 3) String currency,
        String category,
        Boolean active
) {}
