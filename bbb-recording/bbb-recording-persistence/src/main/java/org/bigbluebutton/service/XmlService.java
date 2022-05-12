package org.bigbluebutton.service;

import org.bigbluebutton.entity.*;
import org.springframework.data.domain.Page;

import java.util.Collection;

public interface XmlService {

    String recordingsToXml(Collection<Recording> recordings);
    String recordingToXml(Recording recording);
    String metadataToXml(Metadata metadata);
    String playbackFormatToXml(PlaybackFormat playbackFormat);
    String thumbnailToXml(Thumbnail thumbnail);
    String callbackDataToXml(CallbackData callbackData);
    String constructResponseFromRecordingsXml(String xml);
    String constructPaginatedResponse(Page<?> page, String response);
    Recording xmlToRecording(String recordId, String xml);
}
