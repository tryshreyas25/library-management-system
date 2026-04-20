package com.library.dto;

import com.library.model.Role;
import lombok.Data;

@Data
public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private Role role;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String name, Role role) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}