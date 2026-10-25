package com.ecommerce.order;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Order Service — the Ordering bounded context.
 *
 * Places customer orders and communicates with the Inventory Service (via
 * Feign + Resilience4j) to reserve stock before confirming an order. If the
 * Inventory Service is down, the circuit breaker opens and the order is
 * rejected gracefully instead of crashing.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableJpaAuditing
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}
