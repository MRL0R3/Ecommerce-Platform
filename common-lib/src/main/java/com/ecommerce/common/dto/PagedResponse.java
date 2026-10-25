package com.ecommerce.common.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Generic paginated response envelope.
 *
 * @param content     the page of items
 * @param pageNumber  zero-based page index
 * @param pageSize    items per page
 * @param totalItems  total item count across all pages
 * @param totalPages  total number of pages
 */
public record PagedResponse<T>(
        List<T> content,
        int pageNumber,
        int pageSize,
        long totalItems,
        int totalPages
) {
    public static <T> PagedResponse<T> from(Page<T> page) {
        return new PagedResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
