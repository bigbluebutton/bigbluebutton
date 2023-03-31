package org.bigbluebutton;

import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.util.DataStore;
import org.junit.jupiter.api.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class RecordingStoreTest {

    private static final Logger logger = LoggerFactory.getLogger(RecordingStoreTest.class);

    private String metadataDirectory = "src/metadata";
    private final RecordingImportHandler importHandler = RecordingImportHandler.getInstance();
    private final RecordingExportHandler exportHandler = RecordingExportHandler.getInstance();
    private DataStore dataStore;

    @BeforeAll
    public static void setup() {
        DataStore.getInstance().truncateTables();
    }

    @Test
    @DisplayName("Recordings should be properly persisted")
    @Order(1)
    public void testPersist() {
        dataStore = DataStore.getInstance();
        importHandler.importRecordings(metadataDirectory, true);
        List<Recording> recordings = dataStore.findAll(Recording.class);
        String[] entries = new File(metadataDirectory).list();

        if (entries == null || entries.length == 0) {
            logger.info("No recordings were found in {}", new File(metadataDirectory).getAbsolutePath());
            return;
        }

        assertTrue(recordings != null);
        assertEquals(entries.length, recordings.size());
    }

    @Test
    @DisplayName("Recording should be properly retrieved")
    @Order(2)
    public void testFind() {
        dataStore = DataStore.getInstance();
        String[] entries = new File(metadataDirectory).list();

        if (entries == null || entries.length == 0) {
            logger.info("No recordings were found in {}", new File(metadataDirectory).getAbsolutePath());
            return;
        }

        for (String entry : entries) {
            Recording recording = dataStore.findRecordingByRecordId(entry);
            assertTrue(recording != null);
        }
    }

    @Test
    @DisplayName("Records should be properly exported")
    @Order(3)
    public void testExportRecording() {
        dataStore = DataStore.getInstance();
        String metadataDirectory = "src/metadata-export";

        exportHandler.exportRecordings(metadataDirectory);

        String[] entries = new File(metadataDirectory).list();
        List<Recording> recordings = dataStore.findAll(Recording.class);

        assertEquals(entries.length, recordings.size());
    }
}
