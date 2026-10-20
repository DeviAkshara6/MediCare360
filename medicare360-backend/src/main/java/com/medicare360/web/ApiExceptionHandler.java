package com.medicare360.web;

import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.time.format.DateTimeParseException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> validation(MethodArgumentNotValidException ex) {
        return Map.of("error", ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage()).collect(Collectors.joining("; ")));
    }
    @ExceptionHandler({IllegalArgumentException.class, ConstraintViolationException.class, DateTimeParseException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> badRequest(Exception ex) { return Map.of("error", ex.getMessage()); }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public Map<String, String> conflict() { return Map.of("error", "An account with that email already exists."); }

    @ExceptionHandler(UsernameNotFoundException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, String> unauthorized() { return Map.of("error", "Invalid email or password."); }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public Map<String, String> badCredentials() { return Map.of("error", "Invalid email or password."); }

    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> notFound(Exception ex) { return Map.of("error", ex.getMessage()); }
}
