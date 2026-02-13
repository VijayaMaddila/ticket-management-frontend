package com.ticketmanagement.controller;

import com.ticketmanagement.model.LoginRequest;
import com.ticketmanagement.model.User;
import com.ticketmanagement.service.UserService;
import com.ticketmanagement.util.JwtUtil;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private UserService userService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        String email = loginRequest.getEmail().trim().toLowerCase();
        String rawPassword = loginRequest.getPassword().trim();

        User user = userService.findByEmailForLogin(email);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }


        boolean passwordMatch = passwordEncoder.matches(
                rawPassword,
                user.getPassword()
        );

        if (!passwordMatch) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }
        String token = JwtUtil.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getName()
        );
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "name", user.getName(),
                "token", token
        ));
    }
}
