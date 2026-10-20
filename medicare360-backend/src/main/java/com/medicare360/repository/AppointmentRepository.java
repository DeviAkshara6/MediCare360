package com.medicare360.repository;
import com.medicare360.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
public interface AppointmentRepository extends MongoRepository<Appointment, String> {
    List<Appointment> findAllByOwnerId(String ownerId);
    Optional<Appointment> findByIdAndOwnerId(String id, String ownerId);
    void deleteByIdAndOwnerId(String id, String ownerId);
}
