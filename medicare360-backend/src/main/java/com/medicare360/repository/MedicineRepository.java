package com.medicare360.repository;
import com.medicare360.model.Medicine;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
public interface MedicineRepository extends MongoRepository<Medicine, String> {
    List<Medicine> findAllByOwnerId(String ownerId);
    Optional<Medicine> findByIdAndOwnerId(String id, String ownerId);
    void deleteByIdAndOwnerId(String id, String ownerId);
}
