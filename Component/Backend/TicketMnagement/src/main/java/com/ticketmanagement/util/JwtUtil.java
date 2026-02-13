package com.ticketmanagement.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.ticketmanagement.model.role.Role;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private static String secret;
    private static long expiration;

    // Inject secret
    @Value("${jwt.secret:ThisIsAVeryStrongJWTSecretKeyThatIsAtLeast32BytesLong}")
    public void setSecret(String secret) {
        JwtUtil.secret = secret;
        log.info("🔐 JWT secret loaded");
    }

    // Inject expiration
    @Value("${jwt.expiration:86400000}")
    public void setExpiration(long expiration) {
        JwtUtil.expiration = expiration;
        log.info("⏱ JWT expiration set to {} ms", expiration);
    }

    // Signing key
    private static Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate JWT token
     */
    public static String generateToken(Long id, String email, Role role, String name) {

        log.info("🚀 Generating JWT token");
        log.info("🆔 id: {}", id);
        log.info("📧 email: {}", email);
        log.info("🎭 role: {}", role);
        log.info("👤 name: {}", name);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        String token = Jwts.builder()
                .setSubject(email)
                .claim("id", id)
                .claim("role", role.name())
                .claim("name", name)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        log.info("✅ JWT token generated successfully");
        return token;
    }

    public static String getEmailFromToken(String token) {
        String email = extractClaims(token).getSubject();
        log.info("📧 Extracted email from token: {}", email);
        return email;
    }

    public static Role getRoleFromToken(String token) {
        Role role = Role.valueOf(
                extractClaims(token).get("role", String.class)
        );
        log.info("🎭 Extracted role from token: {}", role);
        return role;
    }

    public Long getIdFromToken(String token) {
        Long id = extractClaims(token).get("id", Long.class);
        log.info("🆔 Extracted id from token: {}", id);
        return id;
    }

    public static String getNameFromToken(String token) {
        String name = extractClaims(token).get("name", String.class);
        log.info("👤 Extracted name from token: {}", name);
        return name;
    }

    public static boolean validateToken(String token) {
        try {
            extractClaims(token);
            log.info("✅ JWT token is valid");
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("❌ Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    private static Claims extractClaims(String token) {
        log.debug("🔍 Parsing JWT token");
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
