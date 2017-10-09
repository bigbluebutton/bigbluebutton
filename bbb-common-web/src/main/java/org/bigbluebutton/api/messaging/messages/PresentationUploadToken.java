package org.bigbluebutton.api.messaging.messages;

public class PresentationUploadToken implements IMessage  {
    public final String podId;
    public final String authzToken;
    public final String filename;

    public PresentationUploadToken(String podId, String authzToken, String filename) {
        this.podId = podId;
        this.authzToken = authzToken;
        this.filename = filename;
    }
}
