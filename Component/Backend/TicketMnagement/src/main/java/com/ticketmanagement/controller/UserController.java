package com.ticketmanagement.controller;

import org.springframework.http.HttpHeaders;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.ticketmanagement.model.User;
import com.ticketmanagement.service.UserService;
import com.ticketmanagement.util.JwtUtil;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

	@Autowired
    private  UserService userService;
	@Autowired
	private JwtUtil jwtService;
	// Create User
	@PostMapping
	public ResponseEntity<?> createUser(@RequestBody User user) {
	    User savedUser = userService.createUser(user);
	    return ResponseEntity.ok(savedUser);
	}

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUser(@PathVariable Long id) {
        try {
            User user = userService.getUser(id);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body("User not found with ID: " + id);
        }
    }

   

    // Update user role
    @PutMapping("/{userId}")  
    
    public ResponseEntity<?> updateUserRole(@PathVariable Long userId,@RequestBody User user) {
        try {
            User updatedUser = userService.updateUserRole(userId,user);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("Failed to update role: " + e.getMessage());
        }
    }
 // ---------------- GET LOGGED-IN PROFILE ----------------
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.getIdFromToken(token);

            User user = userService.getUser(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid token or user not found");
        }
    }

    // ---------------- UPDATE LOGGED-IN PROFILE ----------------
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader,
                                           @RequestBody User updatedUser) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.getIdFromToken(token);

            User user = userService.updateProfile(userId, updatedUser.getName(), updatedUser.getPassword());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Profile update failed: " + e.getMessage());
        }
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<?> uploadPhoto(@RequestHeader("Authorization") String authHeader,
                                         @RequestParam("file") MultipartFile file) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.getIdFromToken(token);

            User user = userService.getUser(userId);
            user.setPhoto(file.getBytes());  // store photo as byte[]
            userService.save(user);

            return ResponseEntity.ok("Photo uploaded successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Photo upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/profile/photo")
    public ResponseEntity<byte[]> getProfilePhoto(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            Long userId = jwtService.getIdFromToken(token);

            User user = userService.getUser(userId);
            byte[] image = user.getPhoto();
            if (image == null || image.length == 0) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, "image/jpeg") 
                    .body(image);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    }

   
    

