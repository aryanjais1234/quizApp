package com.userService.user_service.model;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
