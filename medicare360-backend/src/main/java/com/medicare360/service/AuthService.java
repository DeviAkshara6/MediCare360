package com.medicare360.service;

import com.medicare360.model.User;
import com.medicare360.repository.UserRepository;
import com.medicare360.security.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwt;
    private final AuthUserService authUsers;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwt, AuthUserService authUsers) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwt = jwt;
        this.authUsers = authUsers;
    }

    public AuthResponse register(String fullName, String email, String password) {
        String normalizedEmail = email.trim().toLowerCase();
        if (users.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("An account with that email already exists.");
        }
        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setFullName(fullName.trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setCreatedAt(OffsetDateTime.now().toString());
        users.save(user);
        return response(authUsers.loadById(user.getId()));
    }

    public AuthResponse login(String email, String password) {
        AuthUser user = authUsers.loadUserByUsername(email.trim().toLowerCase());
        if (!passwordEncoder.matches(password, user.passwordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        return response(user);
    }

    public AuthResponse response(AuthUser user) {
        return new AuthResponse(jwt.createToken(user), new UserResponse(user.id(), user.fullName(), user.email()));
    }

    public record AuthResponse(String token, UserResponse user) {}
    public record UserResponse(String id, String fullName, String email) {}
}
