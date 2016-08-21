package org.bigbluebutton.transcode.api;

public class DestroyMeetingTranscoderReply extends InternalMessage {
    public final String meetingId;
    public final String transcoderId;

    public DestroyMeetingTranscoderReply(String meetingId, String transcoderId) {
        this.meetingId = meetingId;
        this.transcoderId = transcoderId;
    }
}
