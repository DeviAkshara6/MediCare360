package com.medicare360.service;

import com.medicare360.model.Appointment;
import com.medicare360.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class AppointmentService {
    private final AppointmentRepository repository;
    public AppointmentService(AppointmentRepository repository) { this.repository = repository; }
    public List<Appointment> findAll() { return repository.findAll(); }
    public Appointment save(Appointment appointment) {
        if (appointment.getDate() != null && appointment.getDate().compareTo(LocalDate.now().toString()) < 0
                && appointment.getStatus() != com.medicare360.model.AppointmentStatus.completed) {
            throw new IllegalArgumentException("Appointments cannot be booked or rescheduled in the past.");
        }
        return repository.save(appointment);
    }
    public void delete(String id) { repository.deleteById(id); }
}
