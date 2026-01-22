package com.ticketmanagement.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.ticketmanagement.model.role.Role;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static String secret;
    private static long expiration;

    // Spring injects secret into static field
    @Value("${jwt.secret:ThisIsAVeryStrongJWTSecretKeyThatIsAtLeast32BytesLong}")
    public void setSecret(String secret) {
        JwtUtil.secret = secret;
    }

    // Spring injects expiration into static field
    @Value("${jwt.expiration:86400000}")
    public void setExpiration(long expiration) {
        JwtUtil.expiration = expiration;
    }

    private static Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public static String generateToken(String email, Role role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role.name())
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public static String getEmailFromToken(String token) {
        return extractClaims(token).getSubject();
    }

    public static Role getRoleFromToken(String token) {
        return Role.valueOf(extractClaims(token).get("role", String.class));
    }

    public static boolean validateToken(String token) {
        try {
            extractClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private static Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
