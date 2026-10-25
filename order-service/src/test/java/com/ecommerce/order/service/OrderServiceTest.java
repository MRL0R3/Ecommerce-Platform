package com.ecommerce.order.service;

import com.ecommerce.common.exception.OutOfStockException;
import com.ecommerce.order.client.InventoryClient;
import com.ecommerce.order.domain.*;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.mapper.OrderMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * OrderService tests — BDD naming, exercises the inter-service flow
 * (Feign call to Inventory + circuit breaker fallback).
 *
 * These tests follow the spec's TDD requirements:
 *   - Red: write createOrder_throwsOutOfStockWhenInventoryReportsZero() first
 *   - Green: implement createOrder() to pass it
 *   - Refactor: clean up + add circuit breaker fallback test
 */
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock private OrderRepository orderRepository;
    @Mock private InventoryClient inventoryClient;
    @Mock private OrderMapper mapper;
    @InjectMocks private OrderService service;

    @Test
    @DisplayName("given product exists and stock available when createOrder then order is confirmed")
    void givenProductExistsAndStockAvailable_whenCreateOrder_thenReturnConfirmedOrderDto() {
        // given
        UUID productId = UUID.randomUUID();
        UUID customerId = UUID.randomUUID();
        CreateOrderItemRequest itemReq = CreateOrderItemRequest.builder()
                .productId(productId)
                .productName("Widget")
                .unitPrice(BigDecimal.valueOf(19.99))
                .quantity(2)
                .build();
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId(customerId)
                .items(List.of(itemReq))
                .build();

        InventoryStockResponse stock = InventoryStockResponse.builder()
                .productId(productId)
                .quantity(100)
                .reserved(2)
                .available(98)
                .build();

        OrderItem mappedItem = OrderItem.builder()
                .productId(productId)
                .productName("Widget")
                .unitPrice(BigDecimal.valueOf(19.99))
                .quantity(2)
                .build();

        Order savedOrder = Order.builder()
                .id(UUID.randomUUID())
                .customerId(customerId)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(BigDecimal.valueOf(39.98))
                .items(List.of(mappedItem))
                .build();

        OrderResponse expected = OrderResponse.builder()
                .id(savedOrder.getId())
                .customerId(customerId)
                .totalAmount(BigDecimal.valueOf(39.98))
                .status("CONFIRMED")
                .build();

        when(inventoryClient.reserve(eq(productId), any())).thenReturn(stock);
        when(mapper.toEntity(itemReq)).thenReturn(mappedItem);
        when(orderRepository.save(any(Order.class))).thenReturn(savedOrder);
        when(mapper.toResponse(savedOrder)).thenReturn(expected);

        // when
        OrderResponse result = service.createOrder(request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.status()).isEqualTo("CONFIRMED");
        verify(inventoryClient).reserve(eq(productId), any());
        verify(orderRepository).save(any());
    }

    @Test
    @DisplayName("given inventory service throws when createOrder then fallback rejects order")
    void givenInventoryThrows_whenCreateOrder_thenFallbackRejectsOrder() {
        // given — Feign call throws (inventory down)
        UUID productId = UUID.randomUUID();
        CreateOrderItemRequest itemReq = CreateOrderItemRequest.builder()
                .productId(productId)
                .productName("Widget")
                .unitPrice(BigDecimal.TEN)
                .quantity(1)
                .build();
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId(UUID.randomUUID())
                .items(List.of(itemReq))
                .build();

        when(inventoryClient.reserve(eq(productId), any()))
                .thenThrow(new RuntimeException("Connection refused"));

        // when / then — circuit breaker fallback should throw OutOfStockException
        assertThatThrownBy(() -> service.createOrder(request))
                .isInstanceOf(OutOfStockException.class)
                .hasMessageContaining("Cannot create order");
        verify(orderRepository, never()).save(any());
    }
}
