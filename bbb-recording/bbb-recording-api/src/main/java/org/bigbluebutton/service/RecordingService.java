package org.bigbluebutton.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.codec.digest.DigestUtils;
import org.bigbluebutton.dao.entity.Events;
import org.bigbluebutton.dao.entity.Recording;
import org.bigbluebutton.dao.entity.Track;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileWriter;
import java.util.List;
import java.util.Map;

public interface RecordingService {

    String getType();

    List<Recording> searchRecordings(List<String> meetingIds, List<String> recordIds, List<String> states,
            Map<String, String> meta);

    Recording findRecording(String recordId);

    Recording updateRecording(String recordId, Map<String, String> meta);

    Recording publishRecording(String recordId, boolean publish);

    boolean deleteRecording(String recordId);

    List<Track> getTracks(String recordId);

    boolean putTrack(MultipartFile file, String recordId, String kind, String lang, String label);

    Events getEvents(String recordId);

    default String convertToInternalId(String id) {
        return DigestUtils.sha1Hex(id);
    }

    default boolean saveTrackInfoFile(Track track, String trackId, String captionsDir) {
        String trackInfoFilePath = captionsDir + File.separatorChar + "inbox" + File.separatorChar + trackId
                + "-track.json";
        String tempTrackInfoFilePath = trackInfoFilePath + ".tmp";

        boolean result;
        try {
            String trackInfoJson = new ObjectMapper().writeValueAsString(track);
            FileWriter writer = new FileWriter(tempTrackInfoFilePath);
            writer.write(trackInfoJson);
            result = true;
            writer.flush();
            writer.close();
        } catch (Exception e) {
            e.printStackTrace();
            result = false;
        }

        if (result)
            result = moveTrackInfoFile(tempTrackInfoFilePath, trackInfoFilePath);

        return result;
    }

    default boolean moveTrackInfoFile(String tempFile, String file) {
        boolean result = false;

        try {
            result = new File(tempFile).renameTo(new File(file));
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }
}
