package com.ecommerce.auth.service;

import com.ecommerce.auth.domain.*;
import com.ecommerce.auth.dto.*;
import com.ecommerce.auth.security.JwtTokenProvider;
import com.ecommerce.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalStateException("Username already taken: " + request.username());
        }
        Role assignedRole = Role.USER;
        if (request.role() != null && request.role().equalsIgnoreCase("ADMIN")) {
            assignedRole = Role.ADMIN;
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(assignedRole)
                .build();
        user = userRepository.save(user);
        log.info("Registered new user id={} username={}", user.getId(), user.getUsername());
        return issueToken(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.username()));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        log.info("User {} logged in", user.getUsername());
        return issueToken(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String usernameOrId) {
        User user;
        try {
            UUID id = UUID.fromString(usernameOrId);
            user = userRepository.findById(id)
                    .orElseGet(() -> userRepository.findByUsername(usernameOrId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + usernameOrId)));
        } catch (IllegalArgumentException e) {
            user = userRepository.findByUsername(usernameOrId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + usernameOrId));
        }
        return toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUserCount() {
        return userRepository.count();
    }

    @Transactional
    public UserResponse updateUserRole(UUID id, String roleStr) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        Role role = Role.valueOf(roleStr.toUpperCase());
        user.setRole(role);
        user = userRepository.save(user);
        log.info("Updated role for user {} to {}", user.getUsername(), role);
        return toUserResponse(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
        log.info("Deleted user with id={}", id);
    }

    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private AuthResponse issueToken(User user) {
        String token = tokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresInMs(tokenProvider.getExpirationMs())
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}
