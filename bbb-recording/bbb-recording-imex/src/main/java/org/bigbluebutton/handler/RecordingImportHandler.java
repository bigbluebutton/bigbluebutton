package org.bigbluebutton.handler;

import org.bigbluebutton.dao.DataStore;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.service.XmlService;
import org.bigbluebutton.service.impl.XmlServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

public class RecordingImportHandler {

    private static final Logger logger = LoggerFactory.getLogger(RecordingImportHandler.class);

    private static RecordingImportHandler instance;
    private final DataStore dataStore;
    private final XmlService xmlService;

    private RecordingImportHandler() {
        dataStore = DataStore.getInstance();
        xmlService = new XmlServiceImpl();
    }

    public static RecordingImportHandler getInstance() {
        if (instance == null) {
            instance = new RecordingImportHandler();
            if (instance.dataStore == null)
                instance = null;
        }

        return instance;
    }

    public void importRecordings(String directory, boolean persist) {
        logger.info("Attempting to import recordings from {}", directory);

        String[] entries = new File(directory).list();

        if (entries == null || entries.length == 0) {
            logger.info("No recordings were found in the provided directory");
            return;
        }

        for (String entry : entries) {
            Recording recording = dataStore.findRecordingByRecordId(entry);
            if (recording != null && persist) {
                logger.info("Record found for {}. Skipping", entry);
                continue;
            }

            String path = directory + "/" + entry + "/metadata.xml";
            importRecording(path, entry, persist);
        }
    }

    public Recording importRecording(String path, String recordId, boolean persist) {
        logger.info("Attempting to import {}", path);

        String content = null;
        try {
            byte[] encoded = Files.readAllBytes(Paths.get(path));
            content = new String(encoded, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Failed to import {}", path);
            e.printStackTrace();
        }

        Recording recording = null;

        if (content != null) {
            logger.info("File content: {}", content);
            recording = xmlService.xmlToRecording(recordId, content);
        }

        if (recording != null && persist)
            dataStore.save(recording);

        return recording;
    }
}
