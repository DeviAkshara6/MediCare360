package com.medicare360.web;

import com.medicare360.model.Appointment;
import com.medicare360.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.medicare360.security.AuthUser;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {
    private final AppointmentService service;
    public AppointmentController(AppointmentService service) { this.service = service; }
    @GetMapping public List<Appointment> all(@AuthenticationPrincipal AuthUser user) { return service.findAll(user.id()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public Appointment create(@Valid @RequestBody Appointment appointment, @AuthenticationPrincipal AuthUser user) { return service.create(appointment, user.id()); }
    @PutMapping("/{id}") public Appointment update(@PathVariable String id, @Valid @RequestBody Appointment appointment, @AuthenticationPrincipal AuthUser user) { return service.update(id, appointment, user.id()); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id, @AuthenticationPrincipal AuthUser user) { service.delete(id, user.id()); }
}
