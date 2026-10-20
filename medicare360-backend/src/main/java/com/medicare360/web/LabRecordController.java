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
import com.medicare360.security.AuthUser;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/labs")
public class LabRecordController {
    private final LabRecordService records;
    private final PdfStorageService pdfs;
    public LabRecordController(LabRecordService records, PdfStorageService pdfs) { this.records = records; this.pdfs = pdfs; }
    @GetMapping public List<LabRecord> all(@AuthenticationPrincipal AuthUser user) { return records.findAll(user.id()); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public LabRecord create(@Valid @RequestBody LabRecord record, @AuthenticationPrincipal AuthUser user) { return records.create(record, user.id()); }
    @PutMapping("/{id}") public LabRecord update(@PathVariable String id, @Valid @RequestBody LabRecord record, @AuthenticationPrincipal AuthUser user) { return records.update(id, record, user.id()); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable String id, @AuthenticationPrincipal AuthUser user) { pdfs.delete(id, user.id()); records.delete(id, user.id()); }

    @PostMapping("/{id}/pdf")
    public LabRecord uploadPdf(@PathVariable String id, @RequestParam("file") MultipartFile file,
                               @AuthenticationPrincipal AuthUser user) throws IOException {
        LabRecord record = records.find(id, user.id());
        var stored = pdfs.store(id, user.id(), file);
        record.setPdfFilename(stored.filename());
        record.setPdfSize(stored.size());
        return records.update(id, record, user.id());
    }

    @DeleteMapping("/{id}/pdf")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePdf(@PathVariable String id, @AuthenticationPrincipal AuthUser user) {
        pdfs.delete(id, user.id());
        LabRecord record = records.find(id, user.id());
        record.setPdfFilename(null); record.setPdfSize(null);
        records.update(id, record, user.id());
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> downloadPdf(@PathVariable String id, @AuthenticationPrincipal AuthUser user) throws IOException {
        records.find(id, user.id());
        var resource = pdfs.get(id, user.id());
        if (resource == null || !resource.exists()) return ResponseEntity.notFound().build();
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
