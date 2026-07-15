package com.example.demo.controller;

import com.example.demo.entity.Appointment;
import com.example.demo.entity.Doctor;
import com.example.demo.entity.Patient;
import com.example.demo.payload.request.AppointmentRequest;
import com.example.demo.repository.AppointmentRepository;
import com.example.demo.repository.DoctorRepository;
import com.example.demo.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','NURSE','PATIENT','PHARMACIST','LAB_TECHNICIAN')")
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','PATIENT','DOCTOR')")
    public ResponseEntity<?> createAppointment(@RequestBody AppointmentRequest req) {
        Patient patient = patientRepository.findById(req.getPatientId())
                .orElse(null);
        Doctor doctor = doctorRepository.findById(req.getDoctorId())
                .orElse(null);

        if (patient == null) {
            return ResponseEntity.badRequest().body("Patient not found with id: " + req.getPatientId());
        }
        if (doctor == null) {
            return ResponseEntity.badRequest().body("Doctor not found with id: " + req.getDoctorId());
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setReason(req.getReason());
        appointment.setStatus(req.getStatus() != null ? req.getStatus() : "SCHEDULED");

        // Parse datetime string
        if (req.getAppointmentDate() != null && !req.getAppointmentDate().isEmpty()) {
            try {
                // Handle ISO format like "2026-07-14T09:30"
                appointment.setAppointmentDate(LocalDateTime.parse(req.getAppointmentDate()));
            } catch (Exception e) {
                appointment.setAppointmentDate(LocalDateTime.now());
            }
        } else {
            appointment.setAppointmentDate(LocalDateTime.now());
        }

        return ResponseEntity.ok(appointmentRepository.save(appointment));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECEPTIONIST','DOCTOR','NURSE')")
    public ResponseEntity<Appointment> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return appointmentRepository.findById(id).map(app -> {
            app.setStatus(status);
            return ResponseEntity.ok(appointmentRepository.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }
}
