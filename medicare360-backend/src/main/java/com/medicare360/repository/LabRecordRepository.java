package com.medicare360.repository;
import com.medicare360.model.LabRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface LabRecordRepository extends MongoRepository<LabRecord, String> {}
