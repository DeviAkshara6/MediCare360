package com.medicare360.web;

import com.medicare360.model.Medicine;
import com.medicare360.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {
    private final MedicineService service;
    public MedicineController(MedicineService service) { this.service = service; }
    @GetMapping public List<Medicine> all() { return service.findAll(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Medicine create(@Valid @RequestBody Medicine medicine) { return service.save(medicine); }
    @PutMapping("/{id}") public Medicine update(@PathVariable String id, @Valid @RequestBody Medicine medicine) { medicine.setId(id); return service.save(medicine); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id) { service.delete(id); }
}
