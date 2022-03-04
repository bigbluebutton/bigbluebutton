package org.bigbluebutton.api.service;

import org.bigbluebutton.api.model.entity.*;

public interface XmlService {

    String recordingToXml(Recording recording);
    String metadataToXml(Metadata metadata);
    String playbackFormatToXml(PlaybackFormat playbackFormat);
    String thumbnailToXml(Thumbnail thumbnail);
    String callbackDataToXml(CallbackData callbackData);
}
