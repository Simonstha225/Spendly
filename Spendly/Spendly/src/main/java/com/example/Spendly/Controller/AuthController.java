package com.example.Spendly.Controller;

import com.example.Spendly.model.User;
import com.example.Spendly.repository.UserRepository;
import com.example.Spendly.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // REGISTER
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody User user) {
        // Check if email already exists
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            return Map.of("error", "Email already exists");
        }
        // Encrypt password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepo.save(user);
        return Map.of("message", "Registered successfully");
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {
        // Find user by email
        return userRepo.findByEmail(user.getEmail())
                .filter(u -> passwordEncoder.matches(
                        user.getPassword(), u.getPassword()))
                .map(u -> Map.of("token", jwtUtil.generateToken(u.getEmail())))
                .orElse(Map.of("error", "Invalid email or password"));
    }
}