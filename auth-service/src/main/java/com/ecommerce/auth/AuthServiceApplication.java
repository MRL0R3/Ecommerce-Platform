package com.ecommerce.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Auth Service — the Identity & Access bounded context.
 *
 * Responsibilities:
 *   - Register users (BCrypt-hashed passwords)
 *   - Authenticate login and issue HS256 JWT tokens containing userId + role
 *   - Other services trust the JWT (shared secret) — no DB lookup per request.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
