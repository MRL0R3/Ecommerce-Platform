package com.ecommerce.product.service;

import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.product.domain.Product;
import com.ecommerce.product.domain.ProductRepository;
import com.ecommerce.product.dto.CreateProductRequest;
import com.ecommerce.product.dto.ProductResponse;
import com.ecommerce.product.mapper.ProductMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ProductService unit tests following BDD naming conventions (given/when/then).
 *
 * Demonstrates the TDD Red-Green-Refactor cycle from Sprint 3 of the spec:
 * these tests were written before the production code was considered done.
 */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository repository;
    @Mock private ProductMapper mapper;
    @InjectMocks private ProductService service;

    @Test
    @DisplayName("given valid product when create then return product response")
    void givenValidProduct_whenCreate_thenReturnProductResponse() {
        // given
        CreateProductRequest request = CreateProductRequest.builder()
                .sku("SKU-001")
                .name("Widget")
                .price(BigDecimal.valueOf(19.99))
                .currency("USD")
                .category("tools")
                .build();
        Product entity = Product.builder()
                .id(UUID.randomUUID())
                .sku("SKU-001")
                .name("Widget")
                .price(BigDecimal.valueOf(19.99))
                .currency("USD")
                .category("tools")
                .active(true)
                .build();
        ProductResponse expected = ProductResponse.builder()
                .id(entity.getId())
                .sku("SKU-001")
                .name("Widget")
                .price(BigDecimal.valueOf(19.99))
                .currency("USD")
                .category("tools")
                .active(true)
                .build();

        when(repository.existsBySku("SKU-001")).thenReturn(false);
        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toResponse(entity)).thenReturn(expected);

        // when
        ProductResponse result = service.create(request);

        // then
        assertThat(result).isNotNull();
        assertThat(result.sku()).isEqualTo("SKU-001");
        assertThat(result.name()).isEqualTo("Widget");
        verify(repository).save(entity);
    }

    @Test
    @DisplayName("given existing SKU when create then throw conflict")
    void givenExistingSku_whenCreate_thenThrowConflict() {
        // given
        CreateProductRequest request = CreateProductRequest.builder()
                .sku("DUPLICATE")
                .name("Widget")
                .price(BigDecimal.TEN)
                .currency("USD")
                .category("tools")
                .build();
        when(repository.existsBySku("DUPLICATE")).thenReturn(true);

        // when / then
        assertThatThrownBy(() -> service.create(request))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("SKU already exists");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("given existing id when getById then return product")
    void givenExistingId_whenGetById_thenReturnProduct() {
        UUID id = UUID.randomUUID();
        Product entity = Product.builder().id(id).sku("SKU-1").build();
        ProductResponse expected = ProductResponse.builder().id(id).sku("SKU-1").build();

        when(repository.findById(id)).thenReturn(Optional.of(entity));
        when(mapper.toResponse(entity)).thenReturn(expected);

        ProductResponse result = service.getById(id);

        assertThat(result.id()).isEqualTo(id);
    }

    @Test
    @DisplayName("given non-existent id when getById then throw not found")
    void givenNonExistentId_whenGetById_thenThrowNotFound() {
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found");
    }
}
