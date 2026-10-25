package com.ecommerce.common.exception;

/**
 * Thrown when an order is placed for a product with insufficient stock.
 * Mapped to HTTP 409 Conflict by the global exception handler.
 */
public class OutOfStockException extends RuntimeException {
    public OutOfStockException(String message) {
        super(message);
    }
}
