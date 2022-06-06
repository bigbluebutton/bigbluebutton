package org.bigbluebutton.service.impl;

import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.service.RecordingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@Qualifier("fileImpl")
public class RecordingServiceFileImpl implements RecordingService {

    private static Logger logger = LoggerFactory.getLogger(RecordingService.class);

    private static final Pattern PRESENTATION_ID_PATTERN = Pattern.compile("^[a-z0-9]{40}-[0-9]{13}\\.[0-9a-zA-Z]{3,4}$");

    private static String processDir = "/var/bigbluebutton/recording/process";
    private static String publishedDir = "/var/bigbluebutton/published";
    private static String unpublishedDir = "/var/bigbluebutton/unpublished";
    private static String deletedDir = "/var/bigbluebutton/deleted";

    @Override
    public List<Recording> searchRecordings(List<String> meetingIds, List<String> recordIds, List<String> states, Map<String, String> meta) {
        return null;
    }

    @Override
    public Recording findRecording(String recordId) {
        return null;
    }

    @Override
    public Recording updateRecording(String recordId, Map<String, String> meta) {
        return null;
    }

    @Override
    public Recording publishRecording(String recordId, boolean publish) {
        return null;
    }

    @Override
    public boolean deleteRecording(String recordId) {
        return false;
    }
}
