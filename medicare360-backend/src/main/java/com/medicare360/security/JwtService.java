package com.medicare360.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey signingKey;
    private final Duration expiration;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration:PT2H}") Duration expiration) {
        if (secret.length() < 32) {
            throw new IllegalArgumentException("app.jwt.secret must be at least 32 characters.");
        }
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiration = expiration;
    }

    public String createToken(AuthUser user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.id())
                .claim("email", user.email())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expiration)))
                .signWith(signingKey)
                .compact();
    }

    public String userId(String token) {
        return claims(token).getSubject();
    }

    public boolean isValid(String token, AuthUser user) {
        Claims claims = claims(token);
        return claims.getSubject().equals(user.id()) && claims.getExpiration().after(new Date());
    }

    private Claims claims(String token) {
        return Jwts.parser().verifyWith(signingKey).build().parseSignedClaims(token).getPayload();
    }
}
