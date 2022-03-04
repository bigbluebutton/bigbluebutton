package org.bigbluebutton.recording;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.io.xml.PrettyPrintWriter;
import com.thoughtworks.xstream.io.xml.StaxDriver;
import org.bigbluebutton.api.model.entity.*;
import org.bigbluebutton.api.util.DataStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.nio.file.Path;
import java.nio.file.Paths;
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

            Path dirPath = Paths.get(path);
            File dir = new File(dirPath.toAbsolutePath() + File.separator + recording.getRecordId());
            logger.info("Checking if directory {} exists", dir.getAbsolutePath());
            if (!dir.exists()) {
                logger.info("Directory does not exist, creating");
                dir.mkdir();
            }

            File file = new File(dir + File.separator + "metadata.xml");
            logger.info("Attempting to create file {}", file.getAbsolutePath());
            boolean fileCreated = file.createNewFile();

            if (fileCreated) {
                logger.info("Exporting {}", recording);

                BufferedWriter writer = new BufferedWriter(new FileWriter(file));
                XStream xStream = new XStream(new StaxDriver());

                // xStream.processAnnotations(Recording.class);
                // xStream.processAnnotations(Metadata.class);
                // xStream.processAnnotations(PlaybackFormat.class);
                // xStream.processAnnotations(Thumbnail.class);
                // xStream.processAnnotations(CallbackData.class);

                xStream.autodetectAnnotations(true);

                xStream.marshal(recording, new PrettyPrintWriter(writer));
            }
        } catch (Exception e) {
            logger.error("Failed to export recording {}", recording.getRecordId());
            e.printStackTrace();
        }
    }
}
