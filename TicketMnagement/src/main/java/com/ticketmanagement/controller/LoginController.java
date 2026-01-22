package com.ticketmanagement.controller;

import com.ticketmanagement.model.LoginRequest;
import com.ticketmanagement.model.User;
import com.ticketmanagement.service.UserService;
import com.ticketmanagement.util.JwtUtil;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api")
public class LoginController {

    @Autowired
    private UserService userService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        // Normalize email
        String email = loginRequest.getEmail().trim().toLowerCase();

        
        User user = userService.findByEmailForLogin(email);
        System.out.println("Login attempt: email=" + loginRequest.getEmail() + 
                " password=" + loginRequest.getPassword());
		if (user != null) {
		 System.out.println("Found user: " + user.getEmail() + 
		                    " DB password=" + user.getPassword());
		}


        if (user != null && loginRequest.getPassword().trim().equals(user.getPassword().trim())) {

            // Generate JWT token
            String token = JwtUtil.generateToken(user.getEmail(), user.getRole());

            return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "token", token
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }
    }

}
