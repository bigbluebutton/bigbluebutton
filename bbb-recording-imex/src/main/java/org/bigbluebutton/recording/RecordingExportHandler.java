package org.bigbluebutton.recording;

import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.util.DataStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.Marshaller;
import java.io.File;
import java.util.List;

public class RecordingExportHandler {

    private static final Logger logger = LoggerFactory.getLogger(RecordingExportHandler.class);

    private static RecordingExportHandler instance;
    private DataStore dataStore;

    private RecordingExportHandler() {
        dataStore = DataStore.getInstance();
    }

    public static RecordingExportHandler getInstance() {
        if (instance == null) {
            instance = new RecordingExportHandler();
        }
        return instance;
    }

    public void exportRecordings(String path) {
        List<Recording> recordings = dataStore.findAll(Recording.class);

        for (Recording recording : recordings) {
            exportRecording(recording, path);
        }
    }

    public void exportRecording(String recordId, String path) {
        Recording recording = null;
        if (recordId != null) {
            recording = dataStore.findRecordingByRecordId(recordId);
        }

        if (recording != null) {
            exportRecording(recording, path);
        }
    }

    private void exportRecording(Recording recording, String path) {
        logger.info("Attempting to export recording {} to {}", recording.getRecordId(), path);
        try {
            JAXBContext context = JAXBContext.newInstance(Recording.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);

            File dir = new File(path + File.separator + recording.getRecordId());
            if (!dir.exists())
                dir.mkdir();

            File file = new File(dir + File.separator + "metadata.xml");
            boolean fileCreated = file.createNewFile();

            if (fileCreated) {
                marshaller.marshal(recording, file);
            }
        } catch (Exception e) {
            logger.error("Failed to export recording {}", recording.getRecordId());
        }
    }
}
