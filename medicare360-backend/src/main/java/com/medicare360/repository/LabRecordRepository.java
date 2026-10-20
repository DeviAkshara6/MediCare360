package com.medicare360.repository;
import com.medicare360.model.LabRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;
public interface LabRecordRepository extends MongoRepository<LabRecord, String> {
    List<LabRecord> findAllByOwnerId(String ownerId);
    Optional<LabRecord> findByIdAndOwnerId(String id, String ownerId);
    void deleteByIdAndOwnerId(String id, String ownerId);
}
