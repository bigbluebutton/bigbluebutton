package org.bigbluebutton.red5.client.messaging;


public class CloseMeetingAllConnectionsMsg implements ClientMessage {

    public final String meetingId;

    public CloseMeetingAllConnectionsMsg(String meetingId) {
        this.meetingId = meetingId;
    }

    public String getMessageName() {
        return "CloseMeetingAllConnectionsMsg";
    }
}
