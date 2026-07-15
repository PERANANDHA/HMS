package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "patients")
@Getter
@Setter
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    
    @Column(unique = true)
    private String email;
    
    private String phone;
    
    private LocalDate dateOfBirth;
    private String gender;
    private String bloodGroup;
    private String address;

    // Optional link to User account for patient portal
    @OneToOne
    @JoinColumn(name = "user_id")
    private User userAccount;
}
