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

    public StoredPdf store(String recordId, String ownerId, MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024
                || (!"application/pdf".equalsIgnoreCase(file.getContentType())
                && !filename.toLowerCase().endsWith(".pdf"))) {
            throw new IllegalArgumentException("Only non-empty PDF files up to 10 MB are allowed.");
        }
        delete(recordId, ownerId);
        ObjectId id;
        try (InputStream input = file.getInputStream()) {
            id = gridFsTemplate.store(input, filename, "application/pdf",
                    java.util.Map.of("labRecordId", recordId, "ownerId", ownerId, "filename", filename));
        }
        return new StoredPdf(id.toHexString(), filename, file.getSize());
    }

    public GridFsResource get(String recordId, String ownerId) {
        var file = gridFsTemplate.findOne(pdfQuery(recordId, ownerId));
        return file == null ? null : gridFsTemplate.getResource(file);
    }

    Query pdfQuery(String recordId, String ownerId) {
        return new Query(new Criteria().andOperator(
                Criteria.where("metadata.labRecordId").is(recordId),
                Criteria.where("metadata.ownerId").is(ownerId)));
    }

    public void delete(String recordId, String ownerId) {
        gridFsTemplate.delete(pdfQuery(recordId, ownerId));
    }

    public record StoredPdf(String id, String filename, long size) {}
}
