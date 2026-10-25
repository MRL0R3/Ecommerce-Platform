package com.ecommerce.product;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Product Service — the Catalog bounded context.
 *
 * Manages products, prices, and categories. Does NOT manage stock (that's the
 * Inventory context). Layering follows hexagonal / ports-and-adapters:
 *
 *   Controller (inbound adapter) -> Service (application) -> Domain (entity) -> Repository (outbound adapter)
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableJpaAuditing
public class ProductServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }
}
