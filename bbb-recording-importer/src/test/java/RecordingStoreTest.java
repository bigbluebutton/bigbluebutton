import static org.junit.jupiter.api.Assertions.*;

import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.util.DataStore;
import org.junit.jupiter.api.*;

import java.io.File;
import java.util.List;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class RecordingStoreTest {

    private String metadataDirectory = "metadata/";
    private RecordingImportHandler handler = RecordingImportHandler.getInstance();
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
        handler.importRecordings(metadataDirectory, true);
        List<Recording> recordings = dataStore.findAll(Recording.class);
        String[] entries = new File(metadataDirectory).list();

        assertTrue(recordings != null);
        assertEquals(entries.length, recordings.size());
    }

    @Test
    @DisplayName("Recording should be properly retrieved")
    @Order(2)
    public void testFind() {
        dataStore = DataStore.getInstance();
        String[] entries = new File(metadataDirectory).list();

        for(String entry: entries) {
            Recording recording = dataStore.findRecordingByRecordId(entry);
            assertTrue(recording != null);
        }
    }
}
