package com.medicare360.web;

import com.medicare360.model.Medicine;
import com.medicare360.service.MedicineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.medicare360.security.AuthUser;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {
    private final MedicineService service;
    public MedicineController(MedicineService service) { this.service = service; }
    @GetMapping public List<Medicine> all(@AuthenticationPrincipal AuthUser user) { return service.findAll(user.id()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Medicine create(@Valid @RequestBody Medicine medicine, @AuthenticationPrincipal AuthUser user) { return service.create(medicine, user.id()); }
    @PutMapping("/{id}") public Medicine update(@PathVariable String id, @Valid @RequestBody Medicine medicine, @AuthenticationPrincipal AuthUser user) { return service.update(id, medicine, user.id()); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id, @AuthenticationPrincipal AuthUser user) { service.delete(id, user.id()); }
}
