package com.ecommerce.order.mapper;

import com.ecommerce.order.domain.Order;
import com.ecommerce.order.domain.OrderItem;
import com.ecommerce.order.dto.*;
import org.mapstruct.*;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "order", ignore = true)
    OrderItem toEntity(CreateOrderItemRequest request);

    OrderResponse toResponse(Order order);

    @Mapping(target = "unitPrice", source = "unitPrice")
    OrderItemResponse toResponse(OrderItem item);

    List<OrderItemResponse> toResponse(List<OrderItem> items);

    @AfterMapping
    default void calculateTotal(@MappingTarget Order order) {
        if (order.getItems() != null && order.getTotalAmount() == null) {
            BigDecimal total = order.getItems().stream()
                    .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            order.setTotalAmount(total);
        }
    }
}
