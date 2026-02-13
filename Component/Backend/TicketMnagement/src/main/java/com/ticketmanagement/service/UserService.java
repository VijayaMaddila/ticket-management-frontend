package com.ticketmanagement.service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.ticketmanagement.model.User;
import com.ticketmanagement.repository.UserRepository;
import com.ticketmanagement.util.JwtUtil;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtService;

    // ---------------- CREATE USER ----------------
    public User createUser(User user) {
        String email = user.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // ---------------- GET ALL USERS ----------------
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ---------------- GET USER BY ID ----------------
    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    // ---------------- FIND USER BY EMAIL ----------------
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    // ---------------- LOGIN BY EMAIL ----------------
    public User findByEmailForLogin(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // ---------------- UPDATE USER ROLE ----------------
    public User updateUserRole(Long userId, User updatedUser) {
        User existingUser = getUser(userId);
        existingUser.setName(updatedUser.getName());
        existingUser.setEmail(updatedUser.getEmail());
        return userRepository.save(existingUser);
    }

    // ---------------- UPDATE PROFILE ----------------
    public User updateProfile(Long userId, String name, String password) {
        User user = getUser(userId);
        user.setName(name);
        if (password != null && !password.isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }
        return userRepository.save(user);
    }

    // ---------------- UPLOAD / UPDATE PROFILE PHOTO ----------------
    public User updateProfilePhoto(Long userId, MultipartFile file) throws IOException {
        User user = getUser(userId);
        if (file != null && !file.isEmpty()) {
            user.setPhoto(file.getBytes()); // store photo in DB
        }
        return userRepository.save(user);
    }

    // ---------------- GET PROFILE PHOTO ----------------
    public byte[] getProfilePhoto(Long userId) {
        User user = getUser(userId);
        return user.getPhoto(); // may return null if no photo uploaded
    }

    public User save(User user) {
        return userRepository.save(user);
    }

}
