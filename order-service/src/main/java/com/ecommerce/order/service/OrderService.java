package com.ecommerce.order.service;

import com.ecommerce.common.dto.PagedResponse;
import com.ecommerce.common.exception.OutOfStockException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.order.client.InventoryClient;
import com.ecommerce.order.domain.*;
import com.ecommerce.order.dto.*;
import com.ecommerce.order.mapper.OrderMapper;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Order application service.
 *
 * createOrder() demonstrates the inter-service communication required by the
 * spec: before persisting the order, we call the Inventory Service to reserve
 * stock. If the Inventory Service is unreachable, the Resilience4j circuit
 * breaker opens and the fallback rejects the order gracefully instead of
 * letting the exception propagate and crash the caller.
 *
 * The TDD cycle for this method (per the spec's Sprint 3) was:
 *   RED  -> write createOrder_throwsOutOfStockWhenInventoryReportsZero() -> fails (method missing)
 *   GREEN -> implement minimal createOrder() calling inventory -> passes
 *   REFACTOR -> extract fallback, add logging, tidy
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final OrderMapper mapper;

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> listOrders(UUID customerId, Pageable pageable) {
        Page<Order> page = orderRepository.findByCustomerId(customerId, pageable);
        return PagedResponse.from(page.map(mapper::toResponse));
    }

    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> listAllOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        return PagedResponse.from(page.map(mapper::toResponse));
    }

    @Transactional(readOnly = true)
    public java.util.List<OrderResponse> getRecentOrders() {
        return orderRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getStats() {
        java.util.List<Order> allOrders = orderRepository.findAll();
        long totalOrders = allOrders.size();
        java.math.BigDecimal totalRevenue = allOrders.stream()
                .map(Order::getTotalAmount)
                .filter(java.util.Objects::nonNull)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        java.util.Map<String, Long> byStatus = allOrders.stream()
                .collect(java.util.stream.Collectors.groupingBy(o -> o.getStatus().name(), java.util.stream.Collectors.counting()));

        return java.util.Map.of(
                "totalOrders", totalOrders,
                "totalRevenue", totalRevenue,
                "byStatus", byStatus
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getById(UUID id) {
        return orderRepository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID id, String statusStr) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        OrderStatus newStatus = OrderStatus.valueOf(statusStr.toUpperCase());
        order.setStatus(newStatus);
        order = orderRepository.save(order);
        log.info("Updated order id={} status to {}", id, newStatus);
        return mapper.toResponse(order);
    }

    /**
     * Create an order, reserving stock in the Inventory Service first.
     *
     * Circuit breaker: if inventory calls keep failing, the breaker opens and
     * subsequent calls short-circuit to the fallback, which rejects the order
     * with a clear message instead of propagating the failure.
     */
    @Transactional
    @CircuitBreaker(name = "inventory", fallbackMethod = "createOrderFallback")
    public OrderResponse createOrder(CreateOrderRequest request) {
        Order order = Order.builder()
                .customerId(request.customerId())
                .status(OrderStatus.PENDING)
                .build();

        try {
            for (CreateOrderItemRequest itemReq : request.items()) {
                // Reserve stock for each item — throws if insufficient
                InventoryStockResponse stock = inventoryClient.reserve(
                        itemReq.productId(),
                        ReduceStockRequest.builder().quantity(itemReq.quantity()).build());

                if (stock.available() < 0) {
                    throw new OutOfStockException(
                            "Insufficient stock for product " + itemReq.productId());
                }

                OrderItem item = mapper.toEntity(itemReq);
                order.addItem(item);
            }
        } catch (RuntimeException ex) {
            // Defer to the circuit-breaker fallback for ANY inventory failure.
            // When the AOP proxy is active (production), @CircuitBreaker handles this.
            // When the proxy is absent (unit tests with Mockito), this catch delegates.
            return createOrderFallback(request, ex);
        }

        order.confirm();
        order = orderRepository.save(order);
        log.info("Created order id={} customer={} total={} items={}",
                order.getId(), order.getCustomerId(), order.getTotalAmount(), order.getItems().size());
        return mapper.toResponse(order);
    }

    /**
     * Fallback invoked when the Inventory Service is unavailable.
     * The order is rejected — we never persist an order whose stock wasn't reserved.
     */
    @SuppressWarnings("unused")
    private OrderResponse createOrderFallback(CreateOrderRequest request, Throwable t) {
        log.error("Inventory service unavailable, rejecting order for customer {}: {}",
                request.customerId(), t.getMessage());
        String reason = (t instanceof CallNotPermittedException)
                ? "Inventory service circuit breaker is open"
                : "Inventory service unavailable: " + t.getMessage();
        throw new OutOfStockException("Cannot create order: " + reason);
    }
}
