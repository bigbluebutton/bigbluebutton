import org.bigbluebutton.api.model.entity.*;
import org.bigbluebutton.api.util.DataStore;
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

public class RecordingImportHandler {

    private static final Logger logger = LoggerFactory.getLogger(RecordingImportHandler.class);

    private static RecordingImportHandler instance;
    private DataStore dataStore;

    private RecordingImportHandler() {
        dataStore = DataStore.getInstance();
    }

    public static RecordingImportHandler getInstance() {
        if (instance == null) {
            instance = new RecordingImportHandler();
        }
        return instance;
    }

    public void importRecordings(String directory, boolean persist) {
        String[] entries = new File(directory).list();

        for (String entry : entries) {
            Recording recording = dataStore.findRecordingByRecordId(entry);
            if (recording != null) {
                continue;
            }

            String path = directory + "/" + entry + "/metadata.xml";
            recording = importRecording(path, entry);
            if (persist)
                dataStore.save(recording);
        }
    }

    public Recording importRecording(String path, String recordId) {
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

            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = null;
            Document document = null;

            try {
                logger.info("Constructing new XML document from XML content");
                builder = factory.newDocumentBuilder();
                document = builder.parse(new InputSource(new StringReader(content)));
            } catch (Exception e) {
                logger.error("Failed to construct XML document from file content");
                e.printStackTrace();
            }

            recording = parseRecordingData(document);

            if (recording.getRecordId() == null || recording.getRecordId().equals(""))
                recording.setRecordId(recordId);
        }

        return recording;
    }

    private Recording parseRecordingData(Document recordingDocument) {
        String id = getNodeData(recordingDocument, "id");
        String state = getNodeData(recordingDocument, "state");
        String published = getNodeData(recordingDocument, "published");
        String startTime = getNodeData(recordingDocument, "start_time");
        String endTime = getNodeData(recordingDocument, "end_time");
        String participants = getNodeData(recordingDocument, "participants");
        String externalId = getNodeData(recordingDocument, "externalId");
        String name = getNodeData(recordingDocument, "name");

        if (tagExists(recordingDocument, "meeting")) {
            Element meeting = (Element) recordingDocument.getElementsByTagName("meeting").item(0);
            externalId = meeting.getAttribute("externalId");
            name = meeting.getAttribute("name");
            if (id == null || id.equals(""))
                id = meeting.getAttribute("id");
        }

        Recording recording = new Recording();
        recording.setRecordId(id);
        recording.setMeetingId(externalId);
        recording.setName(name);
        recording.setPublished(Boolean.parseBoolean(published));
        recording.setState(state);

        try {
            recording.setStartTime(
                    LocalDateTime.ofInstant(Instant.ofEpochMilli(Long.parseLong(startTime)), ZoneId.systemDefault()));
            recording.setEndTime(
                    LocalDateTime.ofInstant(Instant.ofEpochMilli(Long.parseLong(endTime)), ZoneId.systemDefault()));
            recording.setParticipants(Integer.parseInt(participants));
        } catch (NumberFormatException e) {
        }

        parseMetadata(recordingDocument, recording);
        PlaybackFormat playback = parsePlaybackFormat(recordingDocument);
        recording.setFormat(playback);
        playback.setRecording(recording);

        logger.info("Finished constructing recording: {}", recording);

        return recording;
    }

    private void parseMetadata(Document recordingDocument, Recording recording) {
        Node meta = recordingDocument.getElementsByTagName("meta").item(0);
        NodeList children = meta.getChildNodes();

        for (int i = 0; i < children.getLength(); i++) {
            Node node = children.item(i);

            if (!(node instanceof Element))
                continue;

            String key = node.getNodeName();
            String value = node.getTextContent();

            Metadata metadata = new Metadata();
            metadata.setKey(key);
            metadata.setValue(value);

            logger.info("Finished constructing metadata: {}", metadata);

            recording.addMetadata(metadata);
        }
    }

    private PlaybackFormat parsePlaybackFormat(Document recordingDocument) {
        Node playbackNode = recordingDocument.getElementsByTagName("playback").item(0);
        PlaybackFormat playback = new PlaybackFormat();
        Element playbackElement = (Element) playbackNode;

        String format = getNodeData(recordingDocument, "format");
        playback.setFormat(format);

        String url = getNodeData(recordingDocument, "link");
        playback.setUrl(url);

        String length = getNodeData(recordingDocument, "duration");
        String processingTime = getNodeData(recordingDocument, "processingTime");

        try {
            playback.setLength(Integer.parseInt(length));
            playback.setProcessingTime(Integer.parseInt(processingTime));
        } catch (NumberFormatException e) {

        }

        NodeList images = recordingDocument.getElementsByTagName("image");

        for (int i = 0; i < images.getLength(); i++) {
            Element image = (Element) images.item(i);

            String height = image.getAttribute("height");
            String width = image.getAttribute("width");
            String alt = image.getAttribute("alt");
            String src = image.getTextContent();

            Thumbnail thumbnail = new Thumbnail();

            try {
                thumbnail.setHeight(Integer.parseInt(height));
                thumbnail.setWidth(Integer.parseInt(width));
            } catch (NumberFormatException e) {
            }

            thumbnail.setAlt(alt);
            thumbnail.setUrl(src);
            thumbnail.setSequence(i);

            logger.info("Finished constructing image: {}", image);

            playback.addThumbnail(thumbnail);
        }

        logger.info("Finished constructing playback format: {}", playback);

        return playback;
    }

    private boolean tagExists(Document document, String tag) {
        NodeList node = document.getElementsByTagName(tag);
        if (node == null || node.getLength() == 0)
            return false;
        return true;
    }

    private String getNodeData(Document document, String tag) {
        String data = "";
        if (!tagExists(document, tag))
            return data;

        NodeList node = document.getElementsByTagName(tag);
        Element element = (Element) node.item(0);
        Node child = element.getFirstChild();

        if (child instanceof CharacterData) {
            CharacterData characterData = (CharacterData) child;
            data = characterData.getData();
        }

        return data;
    }
}
