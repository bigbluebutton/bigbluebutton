package org.bigbluebutton.transcode.api;

public class TranscodingFinishedSuccessfully extends InternalMessage {
    private final String meetingId;
    private final String transcoderId;

    public TranscodingFinishedSuccessfully (String meetingId, String transcoderId) {
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
