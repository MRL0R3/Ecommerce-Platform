package com.ecommerce.auth.dto;

import lombok.Builder;
import java.time.Instant;
import java.util.UUID;

@Builder
public record UserResponse(
    UUID id,
    String username,
    String email,
    String role,
    Instant createdAt
) {}
