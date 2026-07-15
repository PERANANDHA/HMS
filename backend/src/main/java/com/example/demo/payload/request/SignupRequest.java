package com.example.demo.payload.request;

import lombok.Getter;
import lombok.Setter;
import java.util.Set;

@Getter
@Setter
public class SignupRequest {
    private String name;
    private String email;
    private String password;
    private Set<String> roles;
}
