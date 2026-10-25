package com.ecommerce.inventory.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

/**
 * InventoryItem aggregate root (Inventory context).
 *
 * Holds the available quantity for a single product (identified by productId
 * from the Catalog context). The quantity is mutated only through domain
 * methods (reserve, restock) to keep invariants intact.
 */
@Entity
@Table(name = "inventory_items")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItem {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID productId;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = false)
    private int reserved = 0;  // allocated to pending orders, not yet shipped

    @Version
    private Long version;     // optimistic locking on concurrent stock changes

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;

    /**
     * Available (not reserved) quantity.
     */
    public int available() {
        return quantity - reserved;
    }

    /**
     * Reserve stock for an order. Throws if insufficient.
     */
    public void reserve(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Reserve amount must be positive");
        }
        if (available() < amount) {
            throw new IllegalStateException(
                    "Insufficient stock for product " + productId
                            + ": available=" + available() + ", requested=" + amount);
        }
        this.reserved += amount;
    }

    /**
     * Actually deduct stock once an order is fulfilled (shipped).
     */
    public void deduct(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deduct amount must be positive");
        }
        if (this.quantity < amount) {
            throw new IllegalStateException("Cannot deduct below zero for product " + productId);
        }
        this.quantity -= amount;
    }

    /**
     * Restock (e.g. after a return or a shipment received).
     */
    public void restock(int amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Restock amount must be positive");
        }
        this.quantity += amount;
    }
}
