package org.bigbluebutton.api.messaging.messages;

public class PresentationUploadToken implements IMessage  {
    public final String podId;
    public final String authzToken;
    public final String filename;
    public final String meetingId;

    public PresentationUploadToken(String podId, String authzToken, String filename, String meetingId) {
        this.podId = podId;
        this.authzToken = authzToken;
        this.filename = filename;
        this.meetingId = meetingId;
    }
}
