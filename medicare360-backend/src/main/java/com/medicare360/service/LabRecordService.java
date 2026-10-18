package com.medicare360.service;

import com.medicare360.model.LabRecord;
import com.medicare360.repository.LabRecordRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LabRecordService {
    private final LabRecordRepository repository;
    public LabRecordService(LabRecordRepository repository) { this.repository = repository; }
    public List<LabRecord> findAll() { return repository.findAll(); }
    public LabRecord save(LabRecord record) { return repository.save(record); }
    public void delete(String id) { repository.deleteById(id); }
}
