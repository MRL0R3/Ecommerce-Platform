package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.*;
import com.ecommerce.auth.security.JwtTokenProvider;
import com.ecommerce.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Auth", description = "User registration, authentication, and user management")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @Operation(summary = "Login and obtain a JWT token")
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @Operation(summary = "Get current authenticated user profile", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public UserResponse getCurrentUser(
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {

        String userId = headerUserId;
        if (userId == null && authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            userId = tokenProvider.getUserIdFromToken(token);
        }

        if (userId == null) {
            throw new IllegalArgumentException("No authentication credentials provided");
        }
        return authService.getCurrentUser(userId);
    }

    @Operation(summary = "List all registered users (admin only)", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/users")
    public List<UserResponse> listUsers() {
        return authService.listUsers();
    }

    @Operation(summary = "Get total user count", security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/users/count")
    public Map<String, Object> getUserCount() {
        return Map.of("totalUsers", authService.getUserCount());
    }

    @Operation(summary = "Update user role", security = @SecurityRequirement(name = "bearerAuth"))
    @PutMapping("/users/{id}/role")
    public UserResponse updateUserRole(@PathVariable UUID id, @Valid @RequestBody UpdateRoleRequest request) {
        return authService.updateUserRole(id, request.role());
    }

    @Operation(summary = "Delete user by ID", security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        authService.deleteUser(id);
    }
}
