package com.medicare360.service;

import com.medicare360.model.Medicine;
import com.medicare360.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDate;
import java.util.NoSuchElementException;

@Service
public class MedicineService {
    private final MedicineRepository repository;
    public MedicineService(MedicineRepository repository) { this.repository = repository; }
    public List<Medicine> findAll(String ownerId) { return repository.findAllByOwnerId(ownerId); }
    public Medicine create(Medicine medicine, String ownerId) {
        medicine.setOwnerId(ownerId);
        return save(medicine);
    }
    public Medicine update(String id, Medicine medicine, String ownerId) {
        Medicine existing = repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new NoSuchElementException("Medicine not found."));
        medicine.setId(existing.getId());
        medicine.setOwnerId(ownerId);
        return save(medicine);
    }
    private Medicine save(Medicine medicine) {
        if (LocalDate.parse(medicine.getEndDate()).isBefore(LocalDate.parse(medicine.getStartDate()))) {
            throw new IllegalArgumentException("Medicine end date cannot be before the start date.");
        }
        return repository.save(medicine);
    }
    public void delete(String id, String ownerId) {
        if (repository.findByIdAndOwnerId(id, ownerId).isEmpty()) {
            throw new NoSuchElementException("Medicine not found.");
        }
        repository.deleteByIdAndOwnerId(id, ownerId);
    }
}
