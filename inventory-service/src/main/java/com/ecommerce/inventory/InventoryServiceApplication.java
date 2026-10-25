package com.ecommerce.inventory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Inventory Service — the Inventory bounded context.
 *
 * Owns stock levels per product. The Order Service talks to this service via
 * Feign to check/reserve stock before confirming an order.
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
public class InventoryServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(InventoryServiceApplication.class, args);
    }
}
