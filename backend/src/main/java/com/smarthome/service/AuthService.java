package com.smarthome.service;

import com.smarthome.dto.*;
import com.smarthome.entity.Role;
import com.smarthome.entity.User;
import com.smarthome.entity.Vendor;
import com.smarthome.entity.ServiceCategory;
import com.smarthome.repository.UserRepository;
import com.smarthome.repository.VendorRepository;
import com.smarthome.repository.ServiceCategoryRepository;
import com.smarthome.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new com.smarthome.exception.ResourceNotFoundException("User not found"));

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new com.smarthome.exception.BadRequestException("Email is already registered!");
        }

        Role role = Role.CUSTOMER;
        if (registerRequest.getRole() != null && registerRequest.getRole().equalsIgnoreCase("WORKER")) {
            role = Role.WORKER;
        }

        User user = User.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .role(role)
                .phone(registerRequest.getPhone())
                .address(registerRequest.getAddress())
                .active(true)
                .build();

        userRepository.save(user);

        // If worker, also create a vendor profile linked to this user
        if (role == Role.WORKER) {
            ServiceCategory category = null;
            if (registerRequest.getCategoryId() != null) {
                category = categoryRepository.findById(registerRequest.getCategoryId()).orElse(null);
            }
            if (category == null) {
                category = categoryRepository.findByActiveTrue().stream().findFirst().orElse(null);
            }

            Vendor vendor = Vendor.builder()
                    .name(registerRequest.getName())
                    .category(category)
                    .experienceYears(registerRequest.getExperience() != null ? registerRequest.getExperience() : 1)
                    .rating(0.0)
                    .totalReviews(0)
                    .price(registerRequest.getPrice() != null ? registerRequest.getPrice() : 499.0)
                    .phone(registerRequest.getPhone())
                    .email(registerRequest.getEmail())
                    .serviceArea(registerRequest.getServiceArea() != null ? registerRequest.getServiceArea() : "Local")
                    .servicePincodes(registerRequest.getServicePincodes()) // Store service pincodes
                    .description(registerRequest.getDescription() != null ? registerRequest.getDescription() : "Professional service provider")
                    .availabilityStatus(true)
                    .approved(true)
                    .blocked(false)
                    .user(user)
                    .build();
            vendorRepository.save(vendor);
        }

        // Auto-login after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
