package org.bigbluebutton.handler;

import org.bigbluebutton.dao.DataStore;
import org.bigbluebutton.dao.entity.Events;
import org.bigbluebutton.dao.entity.Recording;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class EventsHandler {

    private static final Logger logger = LoggerFactory.getLogger(EventsHandler.class);

    private static EventsHandler instance;
    private DataStore dataStore;

    private EventsHandler() {
        dataStore = DataStore.getInstance();
    }

    public static EventsHandler getInstance() {
        if (instance == null) {
            instance = new EventsHandler();
            if (instance.dataStore == null)
                instance = null;
        }

        return instance;
    }

    public void importEvents(String directory, boolean persist) {
        logger.info("Attempting to import recording events from {}", directory);

        String[] entries = new File(directory).list();

        if (entries == null || entries.length == 0) {
            logger.info("No recordings were found in the provided directory");
            return;
        }

        for (String entry : entries) {
            Recording recording = dataStore.findRecordingByRecordId(entry);
            if (recording != null) {
                Events events = recording.getEvents();
                if (events != null && persist) {
                    logger.info("Events found for recording {}. Skipping", entry);
                    continue;
                }
            }

            String path = directory + "/" + entry + "/data.json";
            importEvents(path, entry, persist);
        }
    }

    public Events importEvents(String path, String recordId, boolean persist) {
        logger.info("Attempting to import {}", path);

        String content = null;
        try {
            byte[] encoded = Files.readAllBytes(Paths.get(path));
            content = new String(encoded, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Failed to import {}", path);
            e.printStackTrace();
        }

        Events events = new Events();

        if (content != null && isValidJson(content)) {
            logger.info("File content: {}", content);
            events.setContent(content);
        }

        if (persist) {
            Recording recording = dataStore.findRecordingByRecordId(recordId);
            recording.setEvents(events);
            events.setRecording(recording);
            dataStore.save(recording);
        }

        return events;
    }

    public void exportEvents(String path) {
        List<Recording> recordings = dataStore.findAll(Recording.class);

        for (Recording recording : recordings) {
            Events events = recording.getEvents();
            if (events != null)
                exportEvents(events, recording.getRecordId(), path);
        }
    }

    public void exportEvents(String recordId, String path) {
        Recording recording = dataStore.findRecordingByRecordId(recordId);
        if (recording != null) {
            Events events = recording.getEvents();
            if (events != null)
                exportEvents(events, recordId, path);
        }
    }

    private void exportEvents(Events events, String recordId, String path) {
        logger.info("Attempting to export events for recording {} to {}", recordId, path);
        try {
            Path dirPath = Paths.get(path);
            File dir = new File(dirPath.toAbsolutePath() + File.separator + recordId);
            logger.info("Checking if directory {} exists", dir.getAbsolutePath());
            if (!dir.exists()) {
                logger.info("Directory does not exist, creating");
                boolean directoryCreated = dir.mkdir();
                if (!directoryCreated) {
                    logger.info("Failed to create export directory.");
                    return;
                }
            }

            File file = new File(dir + File.separator + "data.json");

            if (file.exists()) {
                logger.info("File {} already exists...replacing it", file.getPath());
                boolean deleted = file.delete();
                if (!deleted) {
                    logger.info("Failed to remove previous data file.");
                    return;
                }
            }

            logger.info("Attempting to create file {}", file.getAbsolutePath());
            boolean fileCreated = file.createNewFile();

            if (fileCreated) {
                logger.info("Exporting {}", events.getContent());
                String content = events.getContent();
                JSONObject json = new JSONObject(content);
                String prettyJson = json.toString(4);
                BufferedWriter writer = new BufferedWriter(new FileWriter(file));
                writer.write(prettyJson);
            }
        } catch (Exception e) {
            logger.error("Failed to export events for recording {}", recordId);
            e.printStackTrace();
        }
    }

    private boolean isValidJson(String json) {
        try {
            new JSONObject(json);
        } catch (JSONException e) {
            try {
                new JSONArray(json);
            } catch (JSONException ex) {
                return false;
            }
        }

        return true;
    }
}
