package org.bigbluebutton.red5.client.messaging;


public class BroadcastToMeetingMsg implements ClientMessage {

    public final String meetingId;
    public final String messageName;
    public final String json;

    public BroadcastToMeetingMsg(String meetingId, String messageName, String json) {
        this.meetingId = meetingId;
        this.messageName = messageName;
        this.json = json;
    }

    public String getMessageName() {
        return messageName;
    }
}
