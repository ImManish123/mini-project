package com.smarthome.controller;

import com.smarthome.dto.ApiResponse;
import com.smarthome.entity.User;
import com.smarthome.exception.ResourceNotFoundException;
import com.smarthome.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile() {
        User user = getCurrentUser();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@RequestBody Map<String, String> updates) {
        User user = getCurrentUser();

        if (updates.containsKey("name")) user.setName(updates.get("name"));
        if (updates.containsKey("phone")) user.setPhone(updates.get("phone"));
        if (updates.containsKey("address")) user.setAddress(updates.get("address"));

        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
