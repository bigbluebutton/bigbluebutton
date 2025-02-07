package org.bigbluebutton.api.messaging.messages;

public class PresentationUploadToken implements IMessage  {
    public final String podId;
    public final String presentationId;
    public final String authzToken;
    public final String filename;
    public final String meetingId;
    public final PluginInformationFromPresentationToken plugin;

    public PresentationUploadToken(String podId, String authzToken,
                                   String filename, String meetingId,
                                   String presentationId, Boolean isFromPlugin,
                                   Integer pluginAssetPersistenceMaxFileSize,
                                   String pluginName) {
        this.podId = podId;
        this.authzToken = authzToken;
        this.presentationId = presentationId;
        this.filename = filename;
        this.meetingId = meetingId;
        this.plugin = new PluginInformationFromPresentationToken(isFromPlugin, pluginAssetPersistenceMaxFileSize, pluginName);
    }
}

