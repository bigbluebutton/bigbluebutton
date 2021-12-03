import static org.junit.jupiter.api.Assertions.*;

import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.util.DataStore;
import org.junit.jupiter.api.BeforeAll;

import java.io.File;
import java.util.List;

public class RecordingStoreTest {

    private String metadataDirectory = "metadata/";
    private RecordingImportHandler handler = RecordingImportHandler.getInstance();
    private DataStore dataStore;

    @BeforeAll
    public static void setup() {
        DataStore.getInstance().truncateTables();
    }


    public void testPersist() {
        dataStore = DataStore.getInstance();
        handler.importRecordings(metadataDirectory, true);
        List<Recording> recordings = dataStore.findAll(Recording.class);
        String[] entries = new File(metadataDirectory).list();

        assertTrue(recordings != null);
        assertEquals(entries.length, recordings.size());
    }

    public void testFind() {
        dataStore = DataStore.getInstance();
        String[] entries = new File(metadataDirectory).list();

        for(String entry: entries) {
            Recording recording = dataStore.findRecordingByRecordId(entry);
            assertTrue(recording != null);
        }
    }
}
