package org.bigbluebutton.api.messaging.messages;

public class MeetingDurationModified implements IMessage {

    public final String meetingId;
    public final Long duration;

    public MeetingDurationModified(String meetingId, Long duration) {
        this.meetingId = meetingId;
        this.duration = duration;
    }
}
