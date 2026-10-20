package com.medicare360.service;

import com.medicare360.model.Medicine;
import com.medicare360.repository.MedicineRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OwnershipIsolationTest {
    @Mock MedicineRepository medicines;

    @Test
    void listsOnlyTheAuthenticatedUsersMedicines() {
        Medicine own = new Medicine();
        own.setId("own");
        when(medicines.findAllByOwnerId("user-a")).thenReturn(List.of(own));

        List<Medicine> result = new MedicineService(medicines).findAll("user-a");

        assertEquals(List.of(own), result);
        verify(medicines).findAllByOwnerId("user-a");
        verify(medicines, never()).findAll();
    }

    @Test
    void cannotUpdateAnotherUsersMedicineByChangingTheId() {
        Medicine submitted = new Medicine();
        submitted.setId("user-b-record");
        when(medicines.findByIdAndOwnerId("user-b-record", "user-a")).thenReturn(Optional.empty());

        assertThrows(java.util.NoSuchElementException.class,
                () -> new MedicineService(medicines).update("user-b-record", submitted, "user-a"));
        verify(medicines, never()).save(any());
    }
}
