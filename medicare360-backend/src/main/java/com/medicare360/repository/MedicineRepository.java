package com.medicare360.repository;
import com.medicare360.model.Medicine;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface MedicineRepository extends MongoRepository<Medicine, String> {}
