package com.ticketmanagement.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ticketmanagement.model.User;
import com.ticketmanagement.model.role.Role;
import com.ticketmanagement.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

 

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

   
    public User findByEmailForLogin(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    // Admin APIs

    public User updateUserRole(Long userId, String roleStr) {
        User user = getUser(userId);
        Role role;
        try {
            role = Role.valueOf(roleStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + roleStr + ". Valid roles: REQUESTER, DATAMEMBER, ADMIN");
        }
        user.setRole(role);
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = getUser(userId);
        userRepository.delete(user);
    }
}