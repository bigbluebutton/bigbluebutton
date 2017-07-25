package org.bigbluebutton.transcode.api;

import java.util.Map;

public class UpdateVideoTranscoderReply extends InternalMessage {
    private final String meetingId;
    private final String transcoderId;
    private final String output;

    public UpdateVideoTranscoderReply(String meetingId, String transcoderId, String output) {
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
