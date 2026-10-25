package com.ecommerce.common.exception;

/**
 * Thrown when a requested resource (product, order, user...) does not exist.
 * Mapped to HTTP 404 by the global exception handler.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
