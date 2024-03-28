package org.bigbluebutton.service;

import org.bigbluebutton.dao.entity.*;
import org.springframework.data.domain.Page;

import java.util.Collection;

public interface XmlService {

    String recordingsToXml(Collection<Recording> recordings);
    String recordingToXml(Recording recording);
    String metadataToXml(Metadata metadata);
    String playbackFormatToXml(PlaybackFormat playbackFormat);
    String thumbnailToXml(Thumbnail thumbnail);
    String callbackDataToXml(CallbackData callbackData);
    String eventsToXml(Events events);
    String constructResponseFromXml(String xml);
    String constructPaginatedResponse(Page<?> page, String response);
    String constructGenericResponse(String[] keys, String[] values);
    Recording xmlToRecording(String recordId, String xml);
}
