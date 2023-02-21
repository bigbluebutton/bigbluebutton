package org.bigbluebutton.api.messaging.messages;

public class EndMeetingPrompt implements IMessage {

    public final String meetingId;

    public EndMeetingPrompt(String meetingId) {
        this.meetingId = meetingId;
    }
}
