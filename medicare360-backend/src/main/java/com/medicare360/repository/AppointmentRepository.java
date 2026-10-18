package com.medicare360.repository;
import com.medicare360.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface AppointmentRepository extends MongoRepository<Appointment, String> {}
