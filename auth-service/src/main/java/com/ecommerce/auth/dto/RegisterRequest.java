package com.ecommerce.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Builder;

@Builder
public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 32) String username,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6, max = 64) String password,
        String role
) {}
