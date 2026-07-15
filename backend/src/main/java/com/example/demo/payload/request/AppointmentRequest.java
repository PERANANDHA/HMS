package com.example.demo.payload.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppointmentRequest {
    private Long patientId;
    private Long doctorId;
    private String appointmentDate; // ISO DateTime string
    private String reason;
    private String status;
}
