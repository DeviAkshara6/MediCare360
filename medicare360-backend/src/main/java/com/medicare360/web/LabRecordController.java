package com.medicare360.web;

import com.medicare360.model.LabRecord;
import com.medicare360.service.LabRecordService;
import com.medicare360.service.PdfStorageService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/labs")
public class LabRecordController {
    private final LabRecordService records;
    private final PdfStorageService pdfs;
    public LabRecordController(LabRecordService records, PdfStorageService pdfs) { this.records = records; this.pdfs = pdfs; }
    @GetMapping public List<LabRecord> all() { return records.findAll(); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public LabRecord create(@Valid @RequestBody LabRecord record) { return records.save(record); }
    @PutMapping("/{id}") public LabRecord update(@PathVariable String id, @Valid @RequestBody LabRecord record) { record.setId(id); return records.save(record); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id) { pdfs.delete(id); records.delete(id); }

    @PostMapping("/{id}/pdf")
    public LabRecord uploadPdf(@PathVariable String id, @RequestParam("file") MultipartFile file) throws IOException {
        LabRecord record = records.findAll().stream().filter(item -> id.equals(item.getId())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Lab record not found."));
        var stored = pdfs.store(id, file);
        record.setPdfFilename(stored.filename());
        record.setPdfSize(stored.size());
        return records.save(record);
    }

    @DeleteMapping("/{id}/pdf")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePdf(@PathVariable String id) {
        pdfs.delete(id);
        records.findAll().stream().filter(item -> id.equals(item.getId())).findFirst().ifPresent(record -> {
            record.setPdfFilename(null); record.setPdfSize(null); records.save(record);
        });
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable String id) throws IOException {
        var resource = pdfs.get(id);
        if (resource == null || !resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
