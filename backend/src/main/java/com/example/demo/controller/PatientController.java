package com.example.demo.controller;

import com.example.demo.entity.Patient;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/patients")
public class PatientController {

    @Autowired
    private PatientRepository patientRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'PATIENT')")
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<?> createPatient(@RequestBody Patient patient) {
        // Check for duplicate email
        if (patient.getEmail() != null && patientRepository.findAll().stream()
                .anyMatch(p -> p.getEmail().equalsIgnoreCase(patient.getEmail()))) {
            return ResponseEntity.badRequest()
                    .body(java.util.Collections.singletonMap("message", "A patient with this email already exists."));
        }
        return ResponseEntity.ok(patientRepository.save(patient));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'PHARMACIST', 'PATIENT')")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        return patientRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<?> updatePatient(@PathVariable Long id, @RequestBody Patient updated) {
        return patientRepository.findById(id).map(existing -> {
            existing.setFirstName(updated.getFirstName());
            existing.setLastName(updated.getLastName());
            existing.setEmail(updated.getEmail());
            existing.setPhone(updated.getPhone());
            existing.setGender(updated.getGender());
            existing.setDateOfBirth(updated.getDateOfBirth());
            existing.setBloodGroup(updated.getBloodGroup());
            existing.setAddress(updated.getAddress());
            return ResponseEntity.ok(patientRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePatient(@PathVariable Long id) {
        return patientRepository.findById(id).map(p -> {
            patientRepository.delete(p);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
