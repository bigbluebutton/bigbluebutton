package org.bigbluebutton.service;

import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.dao.entity.Recording;

import java.util.List;
import java.util.Map;

public interface RecordingService {

    List<Recording> searchRecordings(List<String> meetingIds, List<String> recordIds, List<String> states, Map<String, String> meta);
    Recording findRecording(String recordId);
    Recording updateRecording(String recordId, Map<String, String> meta);
    Recording publishRecording(String recordId, boolean publish);
    boolean deleteRecording(String recordId);

    default String convertToInternalId(String id) { return DigestUtils.sha1Hex(id); }
}
