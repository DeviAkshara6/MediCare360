package com.medicare360.web;

import com.medicare360.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthService.AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        if (!request.password().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }
        return auth.register(request.fullName(), request.email(), request.password());
    }

    @PostMapping("/login")
    public AuthService.AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return auth.login(request.email(), request.password());
    }

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String fullName,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 8, max = 128) String password,
            @NotBlank String confirmPassword) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {}
}
