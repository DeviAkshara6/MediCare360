package com.medicare360.web;

import com.medicare360.model.Appointment;
import com.medicare360.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService service;
    public AppointmentController(AppointmentService service) { this.service = service; }
    @GetMapping public List<Appointment> all() { return service.findAll(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Appointment create(@Valid @RequestBody Appointment appointment) { return service.save(appointment); }
    @PutMapping("/{id}") public Appointment update(@PathVariable String id, @Valid @RequestBody Appointment appointment) { appointment.setId(id); return service.save(appointment); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id) { service.delete(id); }
}
