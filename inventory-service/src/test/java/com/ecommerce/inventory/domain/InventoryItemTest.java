package com.ecommerce.inventory.domain;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class InventoryItemTest {

    @Test
    @DisplayName("given item with quantity 10 when reserve 3 then available is 7")
    void givenItemWithQuantity10_whenReserve3_thenAvailableIs7() {
        InventoryItem item = InventoryItem.builder()
                .id(UUID.randomUUID())
                .productId(UUID.randomUUID())
                .quantity(10)
                .reserved(0)
                .build();

        item.reserve(3);

        assertThat(item.getReserved()).isEqualTo(3);
        assertThat(item.available()).isEqualTo(7);
    }

    @Test
    @DisplayName("given item with available 2 when reserve 5 then throw")
    void givenItemWithAvailable2_whenReserve5_thenThrow() {
        InventoryItem item = InventoryItem.builder()
                .productId(UUID.randomUUID())
                .quantity(5)
                .reserved(3)
                .build();

        assertThatThrownBy(() -> item.reserve(5))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    @DisplayName("given item when restock 10 then quantity increases by 10")
    void givenItem_whenRestock10_thenQuantityIncreases() {
        InventoryItem item = InventoryItem.builder()
                .productId(UUID.randomUUID())
                .quantity(5)
                .reserved(0)
                .build();

        item.restock(10);

        assertThat(item.getQuantity()).isEqualTo(15);
    }

    @Test
    @DisplayName("given item with quantity 10 when deduct 4 then quantity is 6")
    void givenItemWithQuantity10_whenDeduct4_thenQuantityIs6() {
        InventoryItem item = InventoryItem.builder()
                .productId(UUID.randomUUID())
                .quantity(10)
                .reserved(0)
                .build();

        item.deduct(4);

        assertThat(item.getQuantity()).isEqualTo(6);
    }
}
