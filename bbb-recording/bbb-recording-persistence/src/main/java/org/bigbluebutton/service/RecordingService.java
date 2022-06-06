package org.bigbluebutton.service;

import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.dao.entity.Recording;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public interface RecordingService {

    List<Recording> searchRecordings(List<String> meetingIds, List<String> recordIds, List<String> states, Map<String, String> meta);
    Recording findRecording(String recordId);
    Recording updateRecording(String recordId, Map<String, String> meta);
    Recording publishRecording(String recordId, boolean publish);
    boolean deleteRecording(String recordId);

    default boolean isMetaValid(String meta) {
        Pattern metaPattern = Pattern.compile("meta_[a-zA-Z][a-zA-Z0-9-]*$");
        Matcher matcher = metaPattern.matcher(meta);
        return matcher.matches();
    }

    default Map<String, String> processMetaParams(Map<String, String> params) {
        Map<String, String> meta = new HashMap<>();

        for(Map.Entry<String, String> entry: params.entrySet()) {
            if(isMetaValid(entry.getKey())) {
               String key =  entry.getKey().substring(0, 5);
               meta.put(key, entry.getValue());
            }
        }

        return meta;
    }

    default String convertToInternalId(String id) { return DigestUtils.sha1Hex(id); }
}
