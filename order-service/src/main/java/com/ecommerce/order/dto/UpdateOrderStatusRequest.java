package com.ecommerce.order.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(
    @NotBlank(message = "Status must not be blank")
    String status
) {}
