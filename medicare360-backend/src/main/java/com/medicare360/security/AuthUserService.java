package com.medicare360.security;

import com.medicare360.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class AuthUserService implements UserDetailsService {
    private final UserRepository users;
    public AuthUserService(UserRepository users) { this.users = users; }

    @Override
    public AuthUser loadUserByUsername(String email) {
        return users.findByEmailIgnoreCase(email)
                .map(user -> new AuthUser(user.getId(), user.getEmail(), user.getPasswordHash(), user.getFullName()))
                .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password."));
    }

    public AuthUser loadById(String id) {
        return users.findById(id)
                .map(user -> new AuthUser(user.getId(), user.getEmail(), user.getPasswordHash(), user.getFullName()))
                .orElseThrow(() -> new UsernameNotFoundException("User account no longer exists."));
    }
}
