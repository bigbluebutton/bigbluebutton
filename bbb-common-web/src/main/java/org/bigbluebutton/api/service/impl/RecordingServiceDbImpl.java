package org.bigbluebutton.api.service.impl;

import org.bigbluebutton.api.messaging.messages.MakePresentationDownloadableMsg;
import org.bigbluebutton.api.service.RecordingService;
import org.bigbluebutton.api.util.DataStore;
import org.bigbluebutton.api2.domain.UploadedTrack;

import java.io.File;
import java.util.List;
import java.util.Map;

public class RecordingServiceDbImpl implements RecordingService {

    DataStore dataStore;

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
    public String getRecordings2x(List<String> idList, List<String> states, Map<String, String> metadataFilters) {

        return null;
    }

    @Override
    public boolean existAnyRecording(List<String> idList) {
        return false;
    }

    @Override
    public boolean changeState(String recordingId, String state) {
        return false;
    }

    @Override
    public void updateMetaParams(List<String> recordIDs, Map<String, String> metaParams) {

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
}
