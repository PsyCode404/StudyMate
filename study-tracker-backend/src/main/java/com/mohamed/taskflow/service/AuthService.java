package com.mohamed.taskflow.service;

import com.mohamed.taskflow.dto.AuthResponse;
import com.mohamed.taskflow.dto.LoginRequest;
import com.mohamed.taskflow.dto.RegisterRequest;
import com.mohamed.taskflow.model.User;
import com.mohamed.taskflow.repository.UserRepository;
import com.mohamed.taskflow.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    
    public AuthResponse register(RegisterRequest request) {
        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(new HashSet<>());
        user.getRoles().add("USER");
        user.setCreatedAt(LocalDateTime.now());
        user.setEnabled(true);
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(savedUser.getUsername())
                .password(savedUser.getPassword())
                .authorities("ROLE_USER")
                .build();
        
        String token = jwtUtil.generateToken(userDetails);
        
        // Build response
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(savedUser.getId())
                        .username(savedUser.getUsername())
                        .email(savedUser.getEmail())
                        .build())
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsernameOrEmail(),
                        request.getPassword()
                )
        );
        
        // Get user details
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        
        // Find user in database
        User user = userRepository.findByUsernameOrEmail(
                request.getUsernameOrEmail(),
                request.getUsernameOrEmail()
        ).orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate JWT token
        String token = jwtUtil.generateToken(userDetails);
        
        // Build response
        return AuthResponse.builder()
                .token(token)
                .user(AuthResponse.UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .build())
                .build();
    }
}
