package org.bigbluebutton.transcode.api;

public class DestroyMeetingTranscoderRequest extends InternalMessage {
    public final String meetingId;

    public DestroyMeetingTranscoderRequest(String meetingId) {
        this.meetingId = meetingId;
    }
}
