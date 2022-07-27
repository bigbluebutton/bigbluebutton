package org.bigbluebutton.service.impl;

import com.google.gson.Gson;
import com.google.gson.internal.LinkedTreeMap;
import com.google.gson.reflect.TypeToken;
import org.apache.commons.io.FileUtils;
import org.bigbluebutton.dao.entity.Events;
import org.bigbluebutton.dao.entity.Metadata;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.dao.entity.Track;
import org.bigbluebutton.service.RecordingService;
import org.bigbluebutton.service.XmlService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;
import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class RecordingServiceFileImpl implements RecordingService {

    private static final Logger logger = LoggerFactory.getLogger(RecordingService.class);

    private static final Pattern PRESENTATION_ID_PATTERN = Pattern
            .compile("^[a-z0-9]{40}-[0-9]{13}\\.[0-9a-zA-Z]{3,4}$");

    private static final String METADATA_FILE = "metadata.xml";
    private static final String CAPTIONS_FILE = "captions.json";

    private static String processDir = "/var/bigbluebutton/recording/process";

    @Value("${bbb.recording.publishedDir}")
    private String publishedDir = "/var/bigbluebutton/published";

    @Value("${bbb.recording.unpublishedDir}")
    private String unpublishedDir = "/var/bigbluebutton/unpublished";

    private static String deletedDir = "/var/bigbluebutton/deleted";
    private String recordStatusDir;

    @Value("${bbb.recording.captionsDir}")
    private String captionsDir;

    @Value("${bbb.recording.presentationBaseDir}")
    private String presentationBaseDir;

    @Value("${bbb.web.defaultServerUrl}")
    private String defaultServerUrl;

    @Value("${bbb.web.defaultTextTrackUrl}")
    private String defaultTextTrackUrl;

    private final XmlService xmlService;

    @Autowired
    public RecordingServiceFileImpl(XmlService xmlService) {
        this.xmlService = xmlService;
    }

    @Override
    public String getType() {
        return "file";
    }

    @Override
    public List<Recording> searchRecordings(List<String> meetingIds, List<String> recordIds, List<String> states,
            Map<String, String> meta) {
        if (recordIds.size() == 0 && meetingIds.size() > 0) {
            for (String meetingId : meetingIds)
                recordIds.add(convertToInternalId(meetingId));
        }

        List<Recording> recordings = getRecordings(recordIds, states);

        if (meta.size() == 0)
            return recordings;

        List<Recording> filteredRecordings = new ArrayList<>();

        for (Map.Entry<String, String> entry : meta.entrySet()) {
            for (Recording recording : recordings) {
                for (Metadata metadata : recording.getMetadata()) {
                    if (metadata.getKey().equals(entry.getKey()) && metadata.getValue().equals(entry.getValue())) {
                        filteredRecordings.add(recording);
                        break;
                    }
                }
            }
        }

        return filteredRecordings;
    }

    @Override
    public Recording findRecording(String recordId) {
        return null;
    }

    @Override
    public Recording updateRecording(String recordId, Map<String, String> meta) {
        List<String> states = new ArrayList<>();
        states.add(Recording.State.PUBLISHED.getValue());
        states.add(Recording.State.UNPUBLISHED.getValue());
        states.add(Recording.State.DELETED.getValue());

        Recording r = null;
        Map<Recording.State, List<File>> allDirectories = getAllDirectories(states);
        for (Map.Entry<Recording.State, List<File>> entry : allDirectories.entrySet()) {
            List<File> recordings = getRecordingsForPath(recordId, entry.getValue());
            for (File recording : recordings) {
                File metadataXml = new File(recording.getPath() + File.separatorChar + METADATA_FILE);
                r = updateRecordingMetadata(metadataXml, meta, metadataXml);
            }
        }

        return r;
    }

    @Override
    public Recording publishRecording(String recordId, boolean publish) {
        Recording recording;
        if (publish)
            recording = changeState(recordId, Recording.State.PUBLISHED);
        else
            recording = changeState(recordId, Recording.State.UNPUBLISHED);
        return recording;
    }

    @Override
    public boolean deleteRecording(String recordId) {
        Recording recording = changeState(recordId, Recording.State.DELETED);
        return recording != null;
    }

    @Override
    public List<Track> getTracks(String recordId) {
        String captionFileUrlDirectory = defaultTextTrackUrl + "/textTrack/";
        String recordingPath = captionsDir + File.separatorChar + recordId;
        List<Track> tracks = new ArrayList<>();

        if (!Files.exists(Paths.get(recordingPath)))
            return null;
        else {
            String captionsFilePath = recordingPath + File.separatorChar + CAPTIONS_FILE;
            try {
                byte[] bytes = Files.readAllBytes(Paths.get(captionsFilePath));
                String captions = new String(bytes, StandardCharsets.UTF_8);

                Gson gson = new Gson();
                Type type = new TypeToken<List<LinkedTreeMap<String, String>>>() {
                }.getType();
                List<LinkedTreeMap<String, String>> captionTracks = gson.fromJson(captions, type);

                for (LinkedTreeMap<String, String> captionTrack : captionTracks) {
                    String caption = captionTrack.get("kind") + "_" + captionTrack.get("lang") + ".vtt";
                    Track track = new Track();
                    track.setHref(captionFileUrlDirectory + recordId + "/" + caption);
                    track.setKind(captionTrack.get("kind"));
                    track.setLabel(captionTrack.get("label"));
                    track.setLang(captionTrack.get("lang"));
                    track.setSource(captionTrack.get("source"));
                    tracks.add(track);
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return tracks;
    }

    @Override
    public boolean putTrack(MultipartFile file, String recordId, String kind, String lang, String label) {
        String contentType = file.getContentType();
        String originalFileName = file.getOriginalFilename();
        String trackId = recordId + "-" + System.currentTimeMillis();
        String tempFileName = trackId + "-track.txt";
        String captionsFilePath = captionsDir + File.separatorChar + "inbox" + File.separatorChar + tempFileName;

        try {
            File captionsFile = new File(captionsFilePath);
            file.transferTo(captionsFile);

            Track track = new Track();
            track.setKind(kind);
            track.setLang(lang);
            track.setOriginalName(originalFileName);
            track.setTempName(tempFileName);
            track.setContentType(contentType);

            return saveTrackInfoFile(track, trackId, captionsDir);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public Events getEvents(String recordId) {
        return null;
    }

    private List<Recording> getRecordings(List<String> recordIds, List<String> states) {
        List<Recording> recordings = new ArrayList<>();

        Map<Recording.State, List<File>> allDirectories = getAllDirectories(states);
        if (recordIds.isEmpty()) {
            for (Map.Entry<Recording.State, List<File>> entry : allDirectories.entrySet()) {
                recordIds.addAll(getAllRecordingIds(entry.getValue()));
            }
        }

        for (String recordId : recordIds) {
            for (Map.Entry<Recording.State, List<File>> entry : allDirectories.entrySet()) {
                List<File> _recs = getRecordingsForPath(recordId, entry.getValue());
                for (File _rec : _recs) {
                    Recording r = getRecording(new File(_rec.getPath() + File.separatorChar + METADATA_FILE));
                    if (r != null) {
                        recordings.add(r);
                    }
                }
            }
        }

        return recordings;
    }

    private Recording getRecording(File file) {
        String content = null;
        try {
            byte[] encoded = Files.readAllBytes(Paths.get(file.getPath()));
            content = new String(encoded, StandardCharsets.UTF_8);
        } catch (IOException e) {
            logger.error("Failed to import {}", file.getPath());
            e.printStackTrace();
        }

        if (content != null) {
            logger.info("File content: {}", content);
            return xmlService.xmlToRecording("", content);
        }

        return null;
    }

    private Map<Recording.State, List<File>> getAllDirectories(List<String> states) {
        Map<Recording.State, List<File>> allDirectories = new HashMap<>();

        if (shouldIncludeState(states, Recording.State.PUBLISHED)) {
            List<File> listedDirectories = getAllDirectories(Recording.State.PUBLISHED);
            allDirectories.put(Recording.State.PUBLISHED, listedDirectories);
        }

        if (shouldIncludeState(states, Recording.State.UNPUBLISHED)) {
            List<File> listedDirectories = getAllDirectories(Recording.State.UNPUBLISHED);
            allDirectories.put(Recording.State.UNPUBLISHED, listedDirectories);
        }

        if (shouldIncludeState(states, Recording.State.DELETED)) {
            List<File> listedDirectories = getAllDirectories(Recording.State.DELETED);
            allDirectories.put(Recording.State.DELETED, listedDirectories);
        }

        if (shouldIncludeState(states, Recording.State.PROCESSING)) {
            List<File> listedDirectories = getAllDirectories(Recording.State.PROCESSING);
            allDirectories.put(Recording.State.PROCESSING, listedDirectories);
        }

        if (shouldIncludeState(states, Recording.State.PROCESSED)) {
            List<File> listedDirectories = getAllDirectories(Recording.State.PROCESSED);
            allDirectories.put(Recording.State.PROCESSED, listedDirectories);
        }

        return allDirectories;
    }

    private boolean shouldIncludeState(List<String> states, Recording.State state) {
        boolean r = false;

        if (!states.isEmpty()) {
            if (states.contains("any")) {
                r = true;
            } else {
                if (state == Recording.State.PUBLISHED && states.contains(Recording.State.PUBLISHED.getValue())) {
                    r = true;
                } else if (state == Recording.State.UNPUBLISHED
                        && states.contains(Recording.State.UNPUBLISHED.getValue())) {
                    r = true;
                } else if (state == Recording.State.DELETED && states.contains(Recording.State.DELETED.getValue())) {
                    r = true;
                } else if (state == Recording.State.PROCESSING
                        && states.contains(Recording.State.PROCESSING.getValue())) {
                    r = true;
                } else if (state == Recording.State.PROCESSED
                        && states.contains(Recording.State.PROCESSED.getValue())) {
                    r = true;
                }
            }

        } else {
            if (state == Recording.State.PUBLISHED || state == Recording.State.UNPUBLISHED) {
                r = true;
            }
        }

        return r;
    }

    private List<File> getAllDirectories(Recording.State state) {
        List<File> allDirectories = new ArrayList<>();

        String dir = getDestinationBaseDirectoryName(state);

        if (dir != null) {
            String[] formats = getPlaybackFormats(dir);
            for (String format : formats) {
                allDirectories.addAll(getDirectories(dir + File.separatorChar + format));
            }
        }

        return allDirectories;
    }

    private String getDestinationBaseDirectoryName(Recording.State state) {
        return getDestinationBaseDirectoryName(state, false);
    }

    private String getDestinationBaseDirectoryName(Recording.State state, boolean forceDefault) {
        String baseDir = null;

        if (state == Recording.State.PROCESSING || state == Recording.State.PROCESSED)
            baseDir = processDir;
        else if (state == Recording.State.PUBLISHED)
            baseDir = publishedDir;
        else if (state == Recording.State.UNPUBLISHED)
            baseDir = unpublishedDir;
        else if (state == Recording.State.DELETED)
            baseDir = deletedDir;
        else if (forceDefault)
            baseDir = publishedDir;

        return baseDir;
    }

    private static String[] getPlaybackFormats(String path) {
        System.out.println("Getting playback formats at " + path);
        List<File> dirs = getDirectories(path);
        String[] formats = new String[dirs.size()];

        for (int i = 0; i < dirs.size(); i++) {
            System.out.println("Playback format = " + dirs.get(i).getName());
            formats[i] = dirs.get(i).getName();
        }
        return formats;
    }

    private static List<File> getDirectories(String path) {
        List<File> files = new ArrayList<>();
        try {
            DirectoryStream<Path> stream = Files.newDirectoryStream(FileSystems.getDefault().getPath(path));
            Iterator<Path> iter = stream.iterator();
            while (iter.hasNext()) {
                Path next = iter.next();
                files.add(next.toFile());
            }
            stream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return files;
    }

    private Set<String> getAllRecordingIds(List<File> recs) {
        Set<String> ids = new HashSet<>();

        Iterator<File> iterator = recs.iterator();
        while (iterator.hasNext()) {
            ids.add(iterator.next().getName());
        }

        return ids;
    }

    private List<File> getRecordingsForPath(String id, List<File> recordings) {
        List<File> recs = new ArrayList<>();

        Iterator<File> iterator = recordings.iterator();
        while (iterator.hasNext()) {
            File rec = iterator.next();
            if (rec.getName().startsWith(id)) {
                recs.add(rec);
            }
        }
        return recs;
    }

    private Recording updateRecordingMetadata(File src, Map<String, String> meta, File dest) {
        Recording recording = getRecording(src);

        if (recording != null) {
            Set<Metadata> metadata = recording.getMetadata();

            for (Map.Entry<String, String> entry : meta.entrySet()) {
                for (Metadata m : metadata) {
                    if (m.getKey().equals(entry.getKey())) {
                        m.setValue(entry.getValue());
                    } else {
                        Metadata newParam = new Metadata();
                        newParam.setKey(entry.getKey());
                        newParam.setValue(entry.getValue());
                        newParam.setRecording(recording);
                        recording.addMetadata(newParam);
                    }
                }
            }

            boolean exported = exportMetadata(dest, recording);
            if (exported)
                return recording;
        }

        return null;
    }

    private boolean exportMetadata(File dest, Recording recording) {
        try {
            if (dest.exists()) {
                boolean deleted = dest.delete();
                if (!deleted) {
                    logger.info("Failed to remove previous metadata file");
                    return false;
                }
            }

            boolean created = dest.createNewFile();

            if (created) {
                String xml = xmlService.recordingToXml(recording);

                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document document = builder.parse(new InputSource(new StringReader(xml)));

                document.normalize();
                XPath xPath = XPathFactory.newInstance().newXPath();
                NodeList nodeList = (NodeList) xPath.evaluate("//text()[normalize-space()='']", document,
                        XPathConstants.NODESET);

                for (int i = 0; i < nodeList.getLength(); i++) {
                    Node node = nodeList.item(i);
                    node.getParentNode().removeChild(node);
                }

                TransformerFactory transformerFactory = TransformerFactory.newInstance();
                Transformer transformer = transformerFactory.newTransformer();
                transformer.setOutputProperty(OutputKeys.ENCODING, "UTF-8");
                transformer.setOutputProperty(OutputKeys.INDENT, "yes");
                transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");
                transformer.setOutputProperty(OutputKeys.STANDALONE, "no");
                DOMSource source = new DOMSource(document);

                StreamResult result = new StreamResult(dest);
                transformer.transform(source, result);

                return true;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return false;
    }

    private Recording changeState(String recordingId, Recording.State state) {
        Recording recording = null;

        if (state.equals(Recording.State.PUBLISHED)) {
            // It can only be published if it is unpublished
            recording = changeState(unpublishedDir, recordingId, state);
        } else if (state.equals(Recording.State.UNPUBLISHED)) {
            // It can only be unpublished if it is published
            recording = changeState(publishedDir, recordingId, state);
        } else if (state.equals(Recording.State.DELETED)) {
            // It can be deleted from any state
            recording = changeState(publishedDir, recordingId, state);
            recording = changeState(unpublishedDir, recordingId, state);
        }

        return recording;
    }

    private Recording changeState(String path, String recordingId, Recording.State state) {
        String[] format = getPlaybackFormats(path);
        Recording r = null;
        for (String aFormat : format) {
            List<File> recordings = getDirectories(path + File.separatorChar + aFormat);
            for (File recording : recordings) {
                if (recording.getName().equalsIgnoreCase(recordingId)) {
                    File dest;
                    if (state == Recording.State.PUBLISHED) {
                        dest = new File(publishedDir + File.separatorChar + aFormat);
                        r = publishRecording(dest, recordingId, recording, aFormat);
                    } else if (state == Recording.State.UNPUBLISHED) {
                        dest = new File(unpublishedDir + File.separatorChar + aFormat);
                        r = unpublishRecording(dest, recordingId, recording, aFormat);
                    } else if (state == Recording.State.DELETED) {
                        dest = new File(deletedDir + File.separatorChar + aFormat);
                        r = deleteRecording(dest, recordingId, recording, aFormat);
                    } else {
                        logger.debug(String.format("State: %s, is not supported", state.getValue()));
                        return null;
                    }
                }
            }
        }

        return r;
    }

    private Recording publishRecording(File destDir, String recordingId, File recordingDir, String format) {
        File metadataXml = new File(recordingDir.getPath() + File.separatorChar + METADATA_FILE);
        Recording recording = getRecording(metadataXml);

        if (recording != null) {
            if (!destDir.exists())
                destDir.mkdirs();

            try {
                FileUtils.moveDirectory(recordingDir, new File(destDir.getPath() + File.separatorChar + recordingId));

                recording.setState(Recording.State.PUBLISHED.getValue());
                recording.setPublished(true);

                File metadataXmlFile = new File(destDir.getAbsolutePath() + File.separatorChar + recordingId
                        + File.separatorChar + METADATA_FILE);

                // Process the changes by saving the recording into metadata.xml
                boolean exported = exportMetadata(metadataXmlFile, recording);
                if (exported)
                    return recording;
            } catch (IOException e) {
                logger.error("Failed to publish recording : " + recordingId, e);
            }
        }
        return null;
    }

    private Recording unpublishRecording(File destDir, String recordingId, File recordingDir, String format) {
        File metadataXml = new File(recordingDir.getPath() + File.separatorChar + METADATA_FILE);
        Recording recording = getRecording(metadataXml);

        if (recording != null) {
            if (!destDir.exists())
                destDir.mkdirs();

            try {
                FileUtils.moveDirectory(recordingDir, new File(destDir.getPath() + File.separatorChar + recordingId));
                recording.setState(Recording.State.UNPUBLISHED.getValue());
                recording.setPublished(false);

                File metadataXmlFile = new File(destDir.getAbsolutePath() + File.separatorChar + recordingId
                        + File.separatorChar + METADATA_FILE);

                // Process the changes by saving the recording into metadata.xml
                boolean exported = exportMetadata(metadataXmlFile, recording);
                if (exported)
                    return recording;
            } catch (IOException e) {
                logger.error("Failed to unpublish recording : " + recordingId, e);
            }
        }

        return null;
    }

    private Recording deleteRecording(File destDir, String recordingId, File recordingDir, String format) {
        File metadataXml = new File(recordingDir.getPath() + File.separatorChar + METADATA_FILE);
        Recording recording = getRecording(metadataXml);

        if (recording != null) {
            if (!destDir.exists())
                destDir.mkdirs();

            try {
                FileUtils.moveDirectory(recordingDir, new File(destDir.getPath() + File.separatorChar + recordingId));
                recording.setState(Recording.State.DELETED.getValue());
                recording.setPublished(false);

                File metadataXmlFile = new File(destDir.getAbsolutePath() + File.separatorChar + recordingId
                        + File.separatorChar + METADATA_FILE);

                // Process the changes by saving the recording into metadata.xml
                boolean exported = exportMetadata(metadataXmlFile, recording);
                if (exported)
                    return recording;
            } catch (IOException e) {
                logger.error("Failed to delete recording : " + recordingId, e);
            }
        }
        return null;
    }
}
