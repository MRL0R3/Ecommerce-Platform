package com.ecommerce.common.exception;

import java.time.Instant;

/**
 * Standardized JSON error envelope returned by every API on failure.
 *
 * Example:
 * {
 *   "timestamp": "2026-07-25T12:34:56Z",
 *   "status": 404,
 *   "error": "Not Found",
 *   "message": "Product not found: 123",
 *   "path": "/api/v1/products/123"
 * }
 */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {}
