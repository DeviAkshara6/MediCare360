package com.medicare360.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PdfOwnershipIsolationTest {
    @Test
    void PDFQueryIncludesBothRecordAndAuthenticatedOwner() {
        String queryJson = new PdfStorageService(null)
                .pdfQuery("lab-a", "user-a").getQueryObject().toJson();

        assertTrue(queryJson.contains("\"metadata.labRecordId\""));
        assertTrue(queryJson.contains("\"lab-a\""));
        assertTrue(queryJson.contains("\"metadata.ownerId\""));
        assertTrue(queryJson.contains("\"user-a\""));
    }
}
