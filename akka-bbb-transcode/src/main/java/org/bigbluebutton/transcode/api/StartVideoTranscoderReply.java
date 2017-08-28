package org.bigbluebutton.transcode.api;

public class StartVideoTranscoderReply extends InternalMessage {
    private final String meetingId;
    private final String transcoderId;
    private final String output;

    public StartVideoTranscoderReply(String meetingId, String transcoderId, String output) {
        this.meetingId = meetingId;
        this.transcoderId = transcoderId;
        this.output = output;
    }

    public String getMeetingId() {
        return meetingId;
    }

    public String getTranscoderId() {
        return transcoderId;
    }

    public String getOutput() {
        return output;
    }

}
