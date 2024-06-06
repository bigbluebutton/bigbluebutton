package org.bigbluebutton;

import org.bigbluebutton.api.model.entity.*;
import org.bigbluebutton.api.util.DataStore;
import org.bigbluebutton.api.service.XmlService;
import org.bigbluebutton.api.service.impl.XmlServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.CharacterData;
import org.w3c.dom.*;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

public class RecordingImportHandler {

    private static final Logger logger = LoggerFactory.getLogger(RecordingImportHandler.class);

    private static RecordingImportHandler instance;
    private DataStore dataStore;
    private XmlService xmlService;

    private RecordingImportHandler() {
        dataStore = DataStore.getInstance();
        xmlService = new XmlServiceImpl();
    }

    public static RecordingImportHandler getInstance() {
        if (instance == null) {
            instance = new RecordingImportHandler();
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

        if (recording != null) {
            if (persist)
                dataStore.save(recording);
        }

        return recording;
    }
}
