import static org.junit.jupiter.api.Assertions.*;

import org.bigbluebutton.api.model.entity.Recording;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

public class RecordingImportHandlerTest {

    private String metadataDirectory = "";
    private RecordingImportHandler handler = RecordingImportHandler.getInstance();

    @Test
    @DisplayName("RecordIDs should be properly parsed")
    public void testParseRecordId() {
        String[] entries = new File(metadataDirectory).list();
        Set<String> ids = new HashSet<>();

        for (String entry : entries) {
            String path = metadataDirectory + "/" + entry + "/metadata.xml";
            Recording recording = handler.importRecording(path, entry);
            ids.add(recording.getRecordId());
            assertEquals(entry, recording.getRecordId());
        }

        assertEquals(entries.length, ids.size());
    }
}
