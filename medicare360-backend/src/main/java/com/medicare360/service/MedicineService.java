package com.medicare360.service;

import com.medicare360.model.Medicine;
import com.medicare360.repository.MedicineRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDate;

@Service
public class MedicineService {
    private final MedicineRepository repository;
    public MedicineService(MedicineRepository repository) { this.repository = repository; }
    public List<Medicine> findAll() { return repository.findAll(); }
    public Medicine save(Medicine medicine) {
        if (LocalDate.parse(medicine.getEndDate()).isBefore(LocalDate.parse(medicine.getStartDate()))) {
            throw new IllegalArgumentException("Medicine end date cannot be before the start date.");
        }
        return repository.save(medicine);
    }
    public void delete(String id) { repository.deleteById(id); }
}
