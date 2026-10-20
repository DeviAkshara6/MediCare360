package com.medicare360.service;

import com.medicare360.model.LabRecord;
import com.medicare360.repository.LabRecordRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class LabRecordService {
    private final LabRecordRepository repository;
    public LabRecordService(LabRecordRepository repository) { this.repository = repository; }
    public List<LabRecord> findAll(String ownerId) { return repository.findAllByOwnerId(ownerId); }
    public LabRecord create(LabRecord record, String ownerId) {
        record.setOwnerId(ownerId);
        return repository.save(record);
    }
    public LabRecord update(String id, LabRecord record, String ownerId) {
        LabRecord existing = repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new NoSuchElementException("Laboratory record not found."));
        record.setId(existing.getId());
        record.setOwnerId(ownerId);
        return repository.save(record);
    }
    public LabRecord find(String id, String ownerId) {
        return repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new NoSuchElementException("Laboratory record not found."));
    }
    public void delete(String id, String ownerId) {
        find(id, ownerId);
        repository.deleteByIdAndOwnerId(id, ownerId);
    }
}
