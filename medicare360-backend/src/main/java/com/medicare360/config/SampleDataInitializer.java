package com.medicare360.config;

import com.medicare360.model.Appointment;
import com.medicare360.model.AppointmentStatus;
import com.medicare360.model.DoseStatus;
import com.medicare360.model.LabRecord;
import com.medicare360.model.Medicine;
import com.medicare360.repository.AppointmentRepository;
import com.medicare360.repository.LabRecordRepository;
import com.medicare360.repository.MedicineRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class SampleDataInitializer {

    @Bean
    CommandLineRunner seedSampleData(
            MedicineRepository medicineRepository,
            AppointmentRepository appointmentRepository,
            LabRecordRepository labRecordRepository) {
        return args -> {
            List<Medicine> missingSampleMedicines = sampleMedicines().stream()
                    .filter(medicine -> !medicineRepository.existsById(medicine.getId()))
                    .collect(Collectors.toList());
            if (!missingSampleMedicines.isEmpty()) {
                medicineRepository.saveAll(missingSampleMedicines);
            }
            if (appointmentRepository.count() == 0) {
                appointmentRepository.saveAll(sampleAppointments());
            }
            if (labRecordRepository.count() == 0) {
                labRecordRepository.saveAll(sampleLabRecords());
            }
        };
    }

    private List<Medicine> sampleMedicines() {
        LocalDate today = LocalDate.now();
        return List.of(
                medicine("sample-med-01", "Metformin 500 mg", "1 tablet",
                        "Twice daily — take with breakfast and dinner.",
                        "08:00", today.minusDays(14), today.plusDays(75)),
                medicine("sample-med-02", "Amlodipine 5 mg", "1 tablet",
                        "Once daily — take at the same time each morning.",
                        "09:00", today.minusDays(30), today.plusDays(150)),
                medicine("sample-med-03", "Vitamin D3 1000 IU", "1 capsule",
                        "Once daily — take after lunch with water.",
                        "13:00", today.minusDays(7), today.plusDays(83)),
                medicine("sample-med-04", "Omeprazole 20 mg", "1 capsule",
                        "Once daily — take 30 minutes before breakfast.",
                        "07:30", today, today.plusDays(28)),
                medicine("sample-med-05", "Atorvastatin 10 mg", "1 tablet",
                        "Once daily at bedtime.",
                        "22:00", today.minusDays(21), today.plusDays(69))
        );
    }

    private Medicine medicine(
            String id,
            String name,
            String dosage,
            String instructions,
            String reminderTime,
            LocalDate startDate,
            LocalDate endDate) {
        Medicine medicine = new Medicine();
        medicine.setId(id);
        medicine.setName(name);
        medicine.setDosage(dosage);
        medicine.setInstructions(instructions);
        medicine.setReminderTime(reminderTime);
        medicine.setStartDate(startDate.toString());
        medicine.setEndDate(endDate.toString());
        medicine.setStatus(DoseStatus.pending);
        medicine.setCreatedAt(OffsetDateTime.now().toString());
        return medicine;
    }

    private List<Appointment> sampleAppointments() {
        LocalDate today = LocalDate.now();
        return List.of(
                appointment("sample-apt-01", "Dr. Anika Rao", "Cardiology",
                        today.plusDays(3), "10:30", "Routine blood pressure follow-up.",
                        AppointmentStatus.upcoming),
                appointment("sample-apt-02", "Dr. Vikram Sen", "General Medicine",
                        today.plusDays(8), "15:00", "Review medication routine and recent symptoms.",
                        AppointmentStatus.upcoming),
                appointment("sample-apt-03", "Dr. Leena Iyer", "Dermatology",
                        today.plusDays(15), "11:15", "Follow-up consultation for seasonal skin irritation.",
                        AppointmentStatus.upcoming),
                appointment("sample-apt-04", "Dr. Arjun Mehta", "Endocrinology",
                        today.minusDays(12), "09:45", "Completed follow-up for routine wellness monitoring.",
                        AppointmentStatus.completed)
        );
    }

    private Appointment appointment(
            String id,
            String doctorName,
            String specialty,
            LocalDate date,
            String time,
            String notes,
            AppointmentStatus status) {
        Appointment appointment = new Appointment();
        appointment.setId(id);
        appointment.setDoctorName(doctorName);
        appointment.setSpecialty(specialty);
        appointment.setDate(date.toString());
        appointment.setTime(time);
        appointment.setNotes(notes);
        appointment.setStatus(status);
        appointment.setCreatedAt(OffsetDateTime.now().toString());
        return appointment;
    }

    private List<LabRecord> sampleLabRecords() {
        LocalDate today = LocalDate.now();
        return List.of(
                labRecord("sample-lab-01", "Complete Blood Count (CBC)",
                        "Sunrise Diagnostics", today.minusDays(6),
                        "Hemoglobin 13.8 g/dL; WBC 7,200/µL; platelets 250,000/µL.",
                        "Fictional sample result — values shown for interface demonstration."),
                labRecord("sample-lab-02", "Lipid Profile",
                        "Harborview Laboratory", today.minusDays(18),
                        "Total cholesterol 192 mg/dL; LDL 118 mg/dL; HDL 48 mg/dL.",
                        "Fictional sample result — discuss results with a qualified clinician."),
                labRecord("sample-lab-03", "Thyroid Profile (T3, T4, TSH)",
                        "Green Valley Labs", today.minusDays(31),
                        "TSH 2.4 µIU/mL; T3 118 ng/dL; T4 8.1 µg/dL.",
                        "Fictional sample result — report marked as reviewed."),
                labRecord("sample-lab-04", "Comprehensive Metabolic Panel",
                        "Sunrise Diagnostics", today.minusDays(44),
                        "Glucose 92 mg/dL; creatinine 0.9 mg/dL; sodium 140 mmol/L.",
                        "Fictional sample result — routine monitoring record."),
                labRecord("sample-lab-05", "Vitamin B12 Test",
                        "Harborview Laboratory", today.minusDays(60),
                        "Vitamin B12 465 pg/mL.",
                        "Fictional sample result — report available for personal reference.")
        );
    }

    private LabRecord labRecord(
            String id,
            String testName,
            String labName,
            LocalDate testDate,
            String resultsSummary,
            String notes) {
        LabRecord record = new LabRecord();
        record.setId(id);
        record.setTestName(testName);
        record.setLabName(labName);
        record.setTestDate(testDate.toString());
        record.setResultsSummary(resultsSummary);
        record.setNotes(notes);
        record.setCreatedAt(OffsetDateTime.now().toString());
        return record;
    }
}
