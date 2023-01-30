package org.bigbluebutton;

import org.bigbluebutton.api.model.entity.Recording;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class RecordingImportHandlerTest {

    private static final Logger logger = LoggerFactory.getLogger(RecordingImportHandlerTest.class);

    private final RecordingImportHandler handler = RecordingImportHandler.getInstance();

    @Test
    @DisplayName("RecordIDs should be properly parsed")
    public void testParseRecordId() {
        String metadataDirectory = "src/metadata";

        String[] entries = new File(metadataDirectory).list();
        Set<String> ids = new HashSet<>();

        if (entries == null || entries.length == 0) {
            logger.info("No recordings were found in {}", new File(metadataDirectory).getAbsolutePath());
            return;
        }

        for (String entry : entries) {
            String path = metadataDirectory + "/" + entry + "/metadata.xml";
            Recording recording = handler.importRecording(path, entry, false);
            ids.add(recording.getRecordId());
            assertEquals(entry, recording.getRecordId());
        }

        assertEquals(entries.length, ids.size());
    }
}
