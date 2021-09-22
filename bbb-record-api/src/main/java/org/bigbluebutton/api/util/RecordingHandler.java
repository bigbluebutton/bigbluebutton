package org.bigbluebutton.api.util;

import com.jcraft.jsch.ChannelSftp;
import org.bigbluebutton.api.model.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.CharacterData;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.StringReader;
import java.io.StringWriter;
import java.sql.SQLXML;
import java.util.Vector;

public class RecordingHandler {

    public static final String BASE_PATH = "/var/bigbluebutton";
    public static final String PUBLISHED_RECORDINGS_PATH = BASE_PATH + "/published/presentation";
    public static final String UNPUBLISHED_RECORDINGS_PATH = BASE_PATH + "/unpublished";

    private static final Logger logger = LoggerFactory.getLogger(RecordingHandler.class);

    private static RecordingHandler instance;
    private RemoteConnectionManager remoteConnectionManager;
    private DataStore dataStore;

    private RecordingHandler() {
        remoteConnectionManager = RemoteConnectionManager.getInstance();
        dataStore = DataStore.getInstance();
    }

    public static RecordingHandler getInstance() {
        if(instance == null) {
            instance = new RecordingHandler();
        }
        return instance;
    }

    public void importRecordings() {
        importRecordings(PUBLISHED_RECORDINGS_PATH);
        importRecordings(UNPUBLISHED_RECORDINGS_PATH);
    }

    public void importRecordings(String directory) {
        Vector<ChannelSftp.LsEntry> entries = remoteConnectionManager.getDirectoryEntries(directory);
        if(entries.size() > 0) {
            for(ChannelSftp.LsEntry entry: entries) {
                if(entry.getFilename().equals(".") || entry.getFilename().equals("..")) {
                    continue;
                }

                Recording recording = dataStore.find(entry.getFilename(), Recording.class);
                if(recording != null) {
                    continue;
                }

                String path = directory + "/" + entry.getFilename() + "/metadata.xml";
                importRecording(path);
            }
        }
    }

    public void importRecording(String path) {
        String recordingData = remoteConnectionManager.readFile(path);
        logger.info("File content: {}", recordingData);

        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = null;
        Document document = null;

        try {
            logger.info("Constructing new XML document from file content");
            builder = factory.newDocumentBuilder();
            document = builder.parse(new InputSource(new StringReader(recordingData)));
        } catch(Exception e) {
            e.printStackTrace();
        }

        Recording recording = parseRecordingData(document);
        dataStore.save(recording);
    }

    private Recording parseRecordingData(Document recordingDocument) {
        String id = getNodeData(recordingDocument, "id");
        String state = getNodeData(recordingDocument, "state");
        String published = getNodeData(recordingDocument, "published");
        String startTime = getNodeData(recordingDocument, "start_time");
        String endTime = getNodeData(recordingDocument, "end_time");
        String participants = getNodeData(recordingDocument, "participants");
        String rawSize = getNodeData(recordingDocument, "raw_size");

        NodeList meetingNode = recordingDocument.getElementsByTagName("meeting");
        Element meetingElement = (Element) meetingNode.item(0);
        String externalId = meetingElement.getAttribute("externalId");
        String name = meetingElement.getAttribute("name");
        String breakout = meetingElement.getAttribute("breakout");

        RecordingMetadata recordingMetadata = parseRecordingMetadata(recordingDocument);
        Playback playback = parsePlayback(recordingDocument);

        Recording recording = new Recording();
        recording.setId(id);
        recording.setMeetingId(externalId);
        recording.setInternalMeetingId(id);
        recording.setName(name);
        recording.setBreakout(Boolean.parseBoolean(breakout));
        recording.setPublished(Boolean.parseBoolean(published));
        recording.setState(state);
        recording.setStartTime(Long.parseLong(startTime));
        recording.setEndTime(Long.parseLong(endTime));
        recording.setParticipants(Integer.parseInt(participants));
        recording.setRawSize(Long.parseLong(rawSize));
        recording.setSize(playback.getFormat().getSize());

        recording.setMetadata(recordingMetadata);
        recordingMetadata.setRecording(recording);

        recording.setPlayback(playback);
        playback.setRecording(recording);

        logger.info("Finished constructing recording: {}", recording);

        return recording;
    }

    private RecordingMetadata parseRecordingMetadata(Document recordingDocument) {
        NodeList metaNode = recordingDocument.getElementsByTagName("meta");
        Node meta = metaNode.item(0);

//        String bbbOrigin = getMetaElementTagContent(metaElement, "bbb-origin");
//        String bbbOriginServerName = getMetaElementTagContent(metaElement, "bbb-origin-server-name");
//        String bbbOriginVersion = getMetaElementTagContent(metaElement, "bbb-origin-version");
//        String glListed = getMetaElementTagContent(metaElement, "gl-listed");
//        String isBreakout = getMetaElementTagContent(metaElement, "isBreakout");
//        String meetingId = getMetaElementTagContent(metaElement, "meetingId");
//        String meetingName = getMetaElementTagContent(metaElement, "meetingName");

        RecordingMetadata recordingMetadata = new RecordingMetadata();
        try {
            String content = nodeToString(meta);
            String trimmedContent = content.trim().replaceAll("[\\s]{2,}", "");
            recordingMetadata.setContent(trimmedContent);
        } catch (TransformerException e) {
            e.printStackTrace();
        }

//        recordingMetadata.setBbbOrigin(bbbOrigin);
//        recordingMetadata.setBbbOriginServerName(bbbOriginServerName);
//        recordingMetadata.setBbbOriginVersion(bbbOriginVersion);
//        recordingMetadata.setGlListed(Boolean.parseBoolean(glListed));
//        recordingMetadata.setIsBreakout(Boolean.parseBoolean(isBreakout));
//        recordingMetadata.setMeetingId(meetingId);
//        recordingMetadata.setMeetingName(meetingName);

        logger.info("Finished constructing metadata: {}", recordingMetadata);

        return recordingMetadata;
    }

    private String getMetaElementTagContent(Element metaElement, String tag) {
        Node node = metaElement.getElementsByTagName(tag).item(0);

        String content = "";
        if(node != null) {
            content = node.getTextContent();
        }

        return content;
    }

    private Playback parsePlayback(Document recordingDocument) {
        NodeList playbackNode = recordingDocument.getElementsByTagName("playback");
        Element playbackElement = (Element) playbackNode.item(0);

        String type = playbackElement.getElementsByTagName("format").item(0).getTextContent();
        String link = playbackElement.getElementsByTagName("link").item(0).getTextContent();
        String processingTime = playbackElement.getElementsByTagName("processing_time").item(0).getTextContent();
        String duration = playbackElement.getElementsByTagName("duration").item(0).getTextContent();
        String size = playbackElement.getElementsByTagName("size").item(0).getTextContent();

        PlaybackFormat playbackFormat = new PlaybackFormat();
        playbackFormat.setType(type);
        playbackFormat.setUrl(link);
        playbackFormat.setProcessingTime(Integer.parseInt(processingTime));
        playbackFormat.setLength(Integer.parseInt(duration) / 60000);
        playbackFormat.setSize(Long.parseLong(size));

        logger.info("Finished constructing playback format: {}", playbackFormat);

        PlaybackFormatPreview playbackFormatPreview = new PlaybackFormatPreview();

        NodeList images = playbackElement.getElementsByTagName("image");

        for(int i = 0; i < images.getLength(); i++) {
            Element imageElement = (Element) images.item(i);

            String width = imageElement.getAttribute("width");
            String height = imageElement.getAttribute("height");
            String alt = imageElement.getAttribute("alt");
            String href = imageElement.getTextContent();

            RecordingImage image = new RecordingImage();
            image.setWidth(Integer.parseInt(width));
            image.setHeight(Integer.parseInt(height));
            image.setAlt(alt);
            image.setSrc(href);

            logger.info("Finished constructing image: {}", image);

            playbackFormatPreview.addImage(image);
        }

        Playback playback = new Playback();

        playback.setFormat(playbackFormat);
        playbackFormat.setPlayback(playback);

        playbackFormat.setPreview(playbackFormatPreview);
        playbackFormatPreview.setFormat(playbackFormat);

        return playback;
    }

    private String getNodeData(Document document, String tag) {
        NodeList node = document.getElementsByTagName(tag);
        Element element = (Element) node.item(0);
        Node child = element.getFirstChild();

        if(child instanceof CharacterData) {
            CharacterData characterData = (CharacterData) child;
            return characterData.getData();
        }

        return "";
    }

    private String nodeToString(Node node) throws TransformerException {
        StringWriter writer = new StringWriter();
        Transformer transformer = TransformerFactory.newInstance().newTransformer();
        transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.transform(new DOMSource(node), new StreamResult(writer));
        return writer.toString();
    }

    private String childNodesToString(Node node) {
        StringBuilder builder = new StringBuilder();
        NodeList children = node.getChildNodes();

        for(int i = 0; i < children.getLength(); i++) {
            try {
                String childString = nodeToString(children.item(i));
                builder.append(childString);
            } catch(TransformerException e) {
                e.printStackTrace();
            }
        }

        return builder.toString();
    }
}
