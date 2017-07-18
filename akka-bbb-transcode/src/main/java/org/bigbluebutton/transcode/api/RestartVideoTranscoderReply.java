package org.bigbluebutton.transcode.api;

public class RestartVideoTranscoderReply extends InternalMessage {
    private final String meetingId;
    private final String transcoderId;
    private final String output;

    public RestartVideoTranscoderReply(String meetingId, String transcoderId, String output) {
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
