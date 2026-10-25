package com.ecommerce.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * API Gateway — single entry point for all clients.
 * Responsibilities:
 *   1. Route requests to downstream services by path prefix.
 *   2. Validate the JWT on protected routes and forward user identity headers.
 *   3. (Production) rate limiting, CORS, TLS termination.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
