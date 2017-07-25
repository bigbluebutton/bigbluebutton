package org.bigbluebutton.transcode.api;

public class DestroyVideoTranscoderReply extends InternalMessage {
    private final String meetingId;
    private final String transcoderId;

    public DestroyVideoTranscoderReply(String meetingId, String transcoderId) {
        this.meetingId = meetingId;
        this.transcoderId = transcoderId;
    }

    public String getMeetingId() {
        return meetingId;
    }

    public String getTranscoderId() {
        return transcoderId;
    }

}
