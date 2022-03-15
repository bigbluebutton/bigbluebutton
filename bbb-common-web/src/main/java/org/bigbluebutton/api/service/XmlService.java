package org.bigbluebutton.api.service;

import org.bigbluebutton.api.model.entity.*;

import java.util.Collection;

public interface XmlService {

    String recordingsToXml(Collection<Recording> recordings);
    String recordingToXml(Recording recording);
    String metadataToXml(Metadata metadata);
    String playbackFormatToXml(PlaybackFormat playbackFormat);
    String thumbnailToXml(Thumbnail thumbnail);
    String callbackDataToXml(CallbackData callbackData);
}
