package org.bigbluebutton.api.service.impl;

import org.bigbluebutton.api.RecordingService;
import org.bigbluebutton.api.messaging.messages.MakePresentationDownloadableMsg;
import org.bigbluebutton.api.model.entity.Metadata;
import org.bigbluebutton.api.model.entity.Recording;
import org.bigbluebutton.api.service.XmlService;
import org.bigbluebutton.api.util.DataStore;
import org.bigbluebutton.api.util.RecordingMetadataReaderHelper;
import org.bigbluebutton.api2.domain.UploadedTrack;

import java.io.File;
import java.util.*;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.data.domain.*;

public class RecordingServiceDbImpl implements RecordingService {

    private static final Logger logger = LoggerFactory.getLogger(RecordingServiceDbImpl.class);

    private String processDir = "/var/bigbluebutton/recording/process";
    private String publishedDir = "/var/bigbluebutton/published";
    private String unpublishedDir = "/var/bigbluebutton/unpublished";
    private String deletedDir = "/var/bigbluebutton/deleted";

    private RecordingMetadataReaderHelper recordingServiceHelper;
    private String recordStatusDir;
    private String captionsDir;
    private Boolean allowFetchAllRecordings;
    private String presentationBaseDir;
    private String defaultServerUrl;
    private String defaultTextTrackUrl;

    private DataStore dataStore;
    private XmlService xmlService;

    public RecordingServiceDbImpl() {
        dataStore = DataStore.getInstance();
    }

    @Override
    public Boolean validateTextTrackSingleUseToken(String recordId, String caption, String token) {
        return null;
    }

    @Override
    public String getRecordingTextTracks(String recordId) {
        return null;
    }

    @Override
    public String putRecordingTextTrack(UploadedTrack track) {
        return null;
    }

    @Override
    public String getCaptionTrackInboxDir() {
        return null;
    }

    @Override
    public String getCaptionsDir() {
        return null;
    }

    @Override
    public boolean isRecordingExist(String recordId) {
        return dataStore.findRecordingByRecordId(recordId) != null;
    }

    @Override
    public String getRecordings2x(List<String> idList, List<String> states, Map<String, String> metadataFilters, int offset, Pageable pageable) {
        // If no IDs or limit were provided return no recordings instead of every recording
        if((idList == null || idList.isEmpty()) && pageable == null && !allowFetchAllRecordings) return xmlService.noRecordings();

        logger.info("Retrieving all recordings");
        Set<Recording> recordings = new HashSet<>(dataStore.findAll(Recording.class));
        logger.info("{} recordings found", recordings.size());

        if(idList != null && !idList.isEmpty()) {
            Set<Recording> recordingsById = new HashSet<>();

            for(String id: idList) {
                logger.info("Finding recordings using meeting ID with value {}", id);
                List<Recording> recordingsByMeetingId = dataStore.findRecordingsByMeetingId(id);

                if(recordingsByMeetingId == null || recordingsByMeetingId.isEmpty()) {
                    logger.info("Finding recordings using recording ID with value {}", id);
                    Recording recording = dataStore.findRecordingByRecordId(id);
                    if(recording != null) {
                        logger.info("Recording found");
                        recordingsById.add(recording);
                    }
                } else {
                    logger.info("{} recordings found", recordingsByMeetingId.size());
                    recordingsById.addAll(recordingsByMeetingId);
                }
            }

            logger.info("Filtering recordings by ID");
            recordings.retainAll(recordingsById);
            logger.info("{} recordings remain", recordings.size());
        }

        if(states != null && !states.isEmpty()) {
            Set<Recording> recordingsByState = new HashSet<>();

            for(String state: states) {
                logger.info("Finding recordings by state {}", state);
                List<Recording> r = dataStore.findRecordingsByState(state);
                if(state != null && !state.isEmpty()) {
                    logger.info("{} recordings found", r.size());
                    recordingsByState.addAll(r);
                }
            }

            logger.info("Filtering recordings by state");
            recordings.retainAll(recordingsByState);
            logger.info("{} recordings remain", recordings.size());
        }

        if(metadataFilters != null && !metadataFilters.isEmpty()) {
            List<Metadata> metadata = new ArrayList<>();

            for(Map.Entry<String, String> filter: metadataFilters.entrySet()) {
                logger.info("Finding metadata using filter {} {}", filter.getKey(), filter.getValue());
                List<Metadata> metadataByFilter = dataStore.findMetadataByFilter(filter.getKey(), filter.getValue());
                if(metadataByFilter != null) {
                    logger.info("{} metadata found", metadataByFilter.size());
                    metadata.addAll(metadataByFilter);
                }
            }

            Set<Recording> recordingsByMetadata = new HashSet<>();
            for(Metadata m: metadata) recordingsByMetadata.add(m.getRecording());

            logger.info("Filtering recordings by metadata");
            recordings.retainAll(recordingsByMetadata);
            logger.info("{} recordings remain", recordings.size());
        }

        // If no/invalid pagination parameters were given do not paginate the response
        if(pageable == null) {
            String recordingsXml = xmlService.recordingsToXml(recordings);
            return xmlService.constructResponseFromRecordingsXml(recordingsXml);
        }

        Page<Recording> recordingsPage = listToPage(new ArrayList<>(recordings), offset, pageable);
        String recordingsXml = xmlService.recordingsToXml(recordingsPage.getContent());
        String response = xmlService.constructResponseFromRecordingsXml(recordingsXml);

        return xmlService.constructPaginatedResponse(recordingsPage, offset, response);
    }

    @Override
    public boolean existAnyRecording(List<String> idList) {
        for(String id: idList) {
            if(dataStore.findRecordingByRecordId(id) != null) return true;
        }
        return false;
    }

    @Override
    public boolean changeState(String recordingId, String state) {
        if(Stream.of(Recording.State.values()).anyMatch(x -> x.getValue().equals(state))) {
            Recording recording = dataStore.findRecordingByRecordId(recordingId);
            if(recording != null) {
                recording.setState(state);
                dataStore.save(recording);
                return true;
            } else {
                logger.error("A recording with ID {} does not exist", recordingId);
            }
        } else {
            logger.error("State [{}] is not a valid state", state);
        }
        return false;
    }

    @Override
    public void updateMetaParams(List<String> recordIDs, Map<String, String> metaParams) {
        Set<Recording> recordings = new HashSet<>();
        for(String id: recordIDs) {
            Recording recording = dataStore.findRecordingByRecordId(id);
            if(recording != null) recordings.add(recording);
        }

        for(Recording recording: recordings) {
            Set<Metadata> metadata = recording.getMetadata();

            for(Map.Entry<String, String> entry: metaParams.entrySet()) {
                for(Metadata m: metadata) {
                    if(m.getKey().equals(entry.getKey())) {
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

            dataStore.save(recording);
        }
    }

    @Override
    public void startIngestAndProcessing(String meetingId) {

    }

    @Override
    public void markAsEnded(String meetingId) {

    }

    @Override
    public void kickOffRecordingChapterBreak(String meetingId, Long timestamp) {

    }

    @Override
    public void processMakePresentationDownloadableMsg(MakePresentationDownloadableMsg msg) {

    }

    @Override
    public File getDownloadablePresentationFile(String meetingId, String presId, String presFilename) {
        return null;
    }

    public void setRecordingStatusDir(String dir) {
        recordStatusDir = dir;
    }

    public void setUnpublishedDir(String dir) {
        unpublishedDir = dir;
    }

    public void setPresentationBaseDir(String dir) {
        presentationBaseDir = dir;
    }

    public void setDefaultServerUrl(String url) {
        defaultServerUrl = url;
    }

    public void setDefaultTextTrackUrl(String url) {
        defaultTextTrackUrl = url;
    }

    public void setPublishedDir(String dir) {
        publishedDir = dir;
    }

    public void setCaptionsDir(String dir) {
        captionsDir = dir;
    }

    public void setAllowFetchAllRecordings(Boolean allowFetchAllRecordings) {
        this.allowFetchAllRecordings = allowFetchAllRecordings;
    }

    public void setRecordingServiceHelper(RecordingMetadataReaderHelper r) {
        recordingServiceHelper = r;
    }

    public void setXmlService(XmlService xmlService) { this.xmlService = xmlService; }
}