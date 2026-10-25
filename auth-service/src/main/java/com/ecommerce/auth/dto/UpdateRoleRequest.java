package com.ecommerce.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateRoleRequest(
    @NotBlank(message = "Role must not be blank")
    String role
) {}
