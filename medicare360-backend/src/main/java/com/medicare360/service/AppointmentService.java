package com.medicare360.service;

import com.medicare360.model.Appointment;
import com.medicare360.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class AppointmentService {
    private final AppointmentRepository repository;
    public AppointmentService(AppointmentRepository repository) { this.repository = repository; }
    public List<Appointment> findAll(String ownerId) { return repository.findAllByOwnerId(ownerId); }
    public Appointment create(Appointment appointment, String ownerId) {
        appointment.setOwnerId(ownerId);
        return save(appointment);
    }
    public Appointment update(String id, Appointment appointment, String ownerId) {
        Appointment existing = repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new NoSuchElementException("Appointment not found."));
        appointment.setId(existing.getId());
        appointment.setOwnerId(ownerId);
        return save(appointment);
    }
    private Appointment save(Appointment appointment) {
        if (appointment.getDate() != null && appointment.getDate().compareTo(LocalDate.now().toString()) < 0
                && appointment.getStatus() != com.medicare360.model.AppointmentStatus.completed) {
            throw new IllegalArgumentException("Appointments cannot be booked or rescheduled in the past.");
        }
        return repository.save(appointment);
    }
    public void delete(String id, String ownerId) {
        if (repository.findByIdAndOwnerId(id, ownerId).isEmpty()) {
            throw new NoSuchElementException("Appointment not found.");
        }
        repository.deleteByIdAndOwnerId(id, ownerId);
    }
}
