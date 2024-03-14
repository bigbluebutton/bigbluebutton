package org.bigbluebutton.api.service;

import org.bigbluebutton.api.model.entity.*;

import java.util.Collection;
import org.springframework.data.domain.*;

public interface XmlService {

    String recordingsToXml(Collection<Recording> recordings);
    String recordingToXml(Recording recording);
    String metadataToXml(Metadata metadata);
    String playbackFormatToXml(PlaybackFormat playbackFormat);
    String thumbnailToXml(Thumbnail thumbnail);
    String callbackDataToXml(CallbackData callbackData);
    String constructResponseFromRecordingsXml(String xml);
    String constructPaginatedResponse(Page<?> page, int offset, String response);
    Recording xmlToRecording(String recordId, String xml);
    String noRecordings();
}
