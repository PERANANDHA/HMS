package com.example.demo.config;

import com.example.demo.entity.*;
import com.example.demo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedRoles();
        seedUsers();
        seedDepartments();
        seedDoctors();
        seedPatients();
        seedAppointments();
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            for (RoleName roleName : RoleName.values()) {
                Role role = new Role();
                role.setName(roleName);
                roleRepository.save(role);
            }
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            createUser("Admin Anbarasan",    "admin@ehms.com",      "admin123",   RoleName.ROLE_ADMIN);
            createUser("Dr. Vijayakumar",    "doctor@ehms.com",     "doctor123",  RoleName.ROLE_DOCTOR);
            createUser("Reception Meenakshi","reception@ehms.com",  "recept123",  RoleName.ROLE_RECEPTIONIST);
            createUser("Nurse Anjali",        "nurse@ehms.com",      "nurse123",   RoleName.ROLE_NURSE);
            createUser("Pharma Selvam",      "pharmacy@ehms.com",   "pharma123",  RoleName.ROLE_PHARMACIST);
            createUser("Lab Tech Loganathan","lab@ehms.com",        "lab123",     RoleName.ROLE_LAB_TECHNICIAN);
            createUser("Patient Jeeva",      "patient@ehms.com",    "patient123", RoleName.ROLE_PATIENT);
        }
    }

    private void createUser(String name, String email, String password, RoleName roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Error: Role " + roleName + " not found."));
        Set<Role> roles = new HashSet<>();
        roles.add(role);

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(roles);
        userRepository.save(user);
    }

    private void seedDepartments() {
        if (departmentRepository.count() == 0) {
            String[] depts = {"Cardiology", "Neurology", "General Surgery", "Pediatrics"};
            for (String d : depts) {
                Department dept = new Department();
                dept.setName(d);
                dept.setDescription(d + " Department");
                departmentRepository.save(dept);
            }
        }
    }

    private void seedDoctors() {
        if (doctorRepository.count() == 0) {
            Department cardio = departmentRepository.findAll().stream().filter(d -> d.getName().equals("Cardiology")).findFirst().orElse(null);
            Department neuro = departmentRepository.findAll().stream().filter(d -> d.getName().equals("Neurology")).findFirst().orElse(null);
            Department surgery = departmentRepository.findAll().stream().filter(d -> d.getName().equals("General Surgery")).findFirst().orElse(null);

            if (cardio != null && neuro != null && surgery != null) {
                Doctor doc1 = new Doctor();
                doc1.setFirstName("Ramesh");
                doc1.setLastName("Kumar");
                doc1.setEmail("r.kumar@ehms.com");
                doc1.setPhone("+91 94440-12345");
                doc1.setSpecialization("Cardiologist");
                doc1.setDepartment(cardio);
                doctorRepository.save(doc1);

                Doctor doc2 = new Doctor();
                doc2.setFirstName("Subhashini");
                doc2.setLastName("Selvam");
                doc2.setEmail("s.selvam@ehms.com");
                doc2.setPhone("+91 98410-67890");
                doc2.setSpecialization("Neurologist");
                doc2.setDepartment(neuro);
                doctorRepository.save(doc2);

                Doctor doc3 = new Doctor();
                doc3.setFirstName("Ganesan");
                doc3.setLastName("Raman");
                doc3.setEmail("g.raman@ehms.com");
                doc3.setPhone("+91 98840-54321");
                doc3.setSpecialization("Surgeon");
                doc3.setDepartment(surgery);
                doctorRepository.save(doc3);
            }
        }
    }

    private void seedPatients() {
        if (patientRepository.count() == 0) {
            Patient p1 = new Patient();
            p1.setFirstName("Jayakumar");
            p1.setLastName("Balan");
            p1.setEmail("jayakumar.balan@example.com");
            p1.setPhone("+91 90030-99887");
            p1.setGender("Male");
            p1.setDateOfBirth(LocalDate.of(1980, 5, 15));
            patientRepository.save(p1);

            Patient p2 = new Patient();
            p2.setFirstName("Janaki");
            p2.setLastName("Raman");
            p2.setEmail("janaki.raman@example.com");
            p2.setPhone("+91 99400-55667");
            p2.setGender("Female");
            p2.setDateOfBirth(LocalDate.of(1992, 8, 20));
            patientRepository.save(p2);
            
            Patient p3 = new Patient();
            p3.setFirstName("Abirami");
            p3.setLastName("Sundaram");
            p3.setEmail("abirami.s@example.com");
            p3.setPhone("+91 97900-11223");
            p3.setGender("Female");
            p3.setDateOfBirth(LocalDate.of(2001, 2, 10));
            patientRepository.save(p3);
        }
    }

    private void seedAppointments() {
        if (appointmentRepository.count() == 0) {
            Doctor doc1 = doctorRepository.findAll().stream().filter(d -> d.getLastName().equals("Kumar")).findFirst().orElse(null);
            Doctor doc2 = doctorRepository.findAll().stream().filter(d -> d.getLastName().equals("Selvam")).findFirst().orElse(null);
            Doctor doc3 = doctorRepository.findAll().stream().filter(d -> d.getLastName().equals("Raman")).findFirst().orElse(null);

            Patient p1 = patientRepository.findAll().stream().filter(p -> p.getLastName().equals("Balan")).findFirst().orElse(null);
            Patient p2 = patientRepository.findAll().stream().filter(p -> p.getLastName().equals("Raman")).findFirst().orElse(null);
            Patient p3 = patientRepository.findAll().stream().filter(p -> p.getLastName().equals("Sundaram")).findFirst().orElse(null);

            if (doc1 != null && doc2 != null && p1 != null && p2 != null) {
                Appointment a1 = new Appointment();
                a1.setPatient(p1);
                a1.setDoctor(doc1);
                a1.setAppointmentDate(LocalDateTime.now().plusDays(1).withHour(9).withMinute(0));
                a1.setStatus("SCHEDULED");
                a1.setReason("Routine Checkup");
                appointmentRepository.save(a1);

                Appointment a2 = new Appointment();
                a2.setPatient(p2);
                a2.setDoctor(doc2);
                a2.setAppointmentDate(LocalDateTime.now().withHour(11).withMinute(30));
                a2.setStatus("COMPLETED");
                a2.setReason("Consultation");
                appointmentRepository.save(a2);
                
                Appointment a3 = new Appointment();
                a3.setPatient(p3);
                a3.setDoctor(doc3);
                a3.setAppointmentDate(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0));
                a3.setStatus("CANCELLED");
                a3.setReason("Follow-up");
                appointmentRepository.save(a3);
            }
        }
    }
}
