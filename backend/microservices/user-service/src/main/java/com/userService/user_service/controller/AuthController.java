package com.userService.user_service.controller;

import com.userService.user_service.config.JwtUtil;
import com.userService.user_service.dao.UserRepository;
import com.userService.user_service.model.AuthRequest;
import com.userService.user_service.model.AuthResponse;
import com.userService.user_service.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Replace the register method in src/main/java/com/userService/user_service/controller/AuthController.java
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        // \- Check if a user exists with same username and role
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("User with the same username and try with different username");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        try {
            userRepository.save(user);
            return ResponseEntity.ok("User registered");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            // ✅ Get role from authenticated principal
            String role = authentication.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_USER"); // default fallback
            System.out.println("============="+role);
            String token = jwtUtil.generateToken(request.getUsername(), role);
            return ResponseEntity.ok(token);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid access");
        }
    }


    @GetMapping("/validate")
    public String validateToken(@RequestParam("token")String token){
        jwtUtil.validateToken(token);
        return "Valid";
    }

    @GetMapping("/role")
    public ResponseEntity<String> getRoleFromToken(@RequestParam("token") String token) {
        String role = jwtUtil.extractRole(token); // Implement extractRole in JwtUtil
        return ResponseEntity.ok(role);
    }

    @GetMapping("/username/{userName}")
    public ResponseEntity<Integer> getUserId(@PathVariable String userName){
        User user = userRepository.findByUsername(userName).orElse(null);
        if(user == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(-1);
        }
        return ResponseEntity.ok(user.getId());
    }
}

