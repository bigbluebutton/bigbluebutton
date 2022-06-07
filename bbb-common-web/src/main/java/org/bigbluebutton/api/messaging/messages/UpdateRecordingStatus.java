package org.bigbluebutton.api.messaging.messages;

public class UpdateRecordingStatus implements IMessage {
    public final String meetingId;
    public final Boolean recording;

    public UpdateRecordingStatus(String meetingId, Boolean recording) {
        this.meetingId = meetingId;
        this.recording = recording;
    }
}
