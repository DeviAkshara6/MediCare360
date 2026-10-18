package com.medicare360.service;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;

@Service
public class PdfStorageService {
    private final GridFsTemplate gridFsTemplate;
    public PdfStorageService(GridFsTemplate gridFsTemplate) { this.gridFsTemplate = gridFsTemplate; }

    public StoredPdf store(String recordId, MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024
                || (!"application/pdf".equalsIgnoreCase(file.getContentType())
                && !filename.toLowerCase().endsWith(".pdf"))) {
            throw new IllegalArgumentException("Only non-empty PDF files up to 10 MB are allowed.");
        }
        delete(recordId);
        ObjectId id;
        try (InputStream input = file.getInputStream()) {
            id = gridFsTemplate.store(input, filename, "application/pdf",
                    java.util.Map.of("labRecordId", recordId, "filename", filename));
        }
        return new StoredPdf(id.toHexString(), filename, file.getSize());
    }

    public GridFsResource get(String recordId) {
        var file = gridFsTemplate.findOne(new Query(Criteria.where("metadata.labRecordId").is(recordId)));
        return file == null ? null : gridFsTemplate.getResource(file);
    }

    public void delete(String recordId) {
        gridFsTemplate.delete(new Query(Criteria.where("metadata.labRecordId").is(recordId)));
    }

    public record StoredPdf(String id, String filename, long size) {}
}
