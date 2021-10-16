package org.bigbluebutton.api.messaging.messages;

public class UploadRequest implements IMessage  {
    public final String meetingId;
    public final String source;
    public final String filename;
    public final String userId;
    public final String token;

    public UploadRequest(String meetingId, String source, String filename, String userId, String token) {
        this.meetingId = meetingId;
        this.source = source;
        this.filename = filename;
        this.userId = userId;
        this.token = token;
    }
}
