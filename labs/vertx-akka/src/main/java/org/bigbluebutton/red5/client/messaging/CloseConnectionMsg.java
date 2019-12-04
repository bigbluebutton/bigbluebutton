package org.bigbluebutton.red5.client.messaging;


public class CloseConnectionMsg implements ClientMessage {

    public final String meetingId;
    public final String connId;

    public CloseConnectionMsg(String meetingId, String connId) {
        this.meetingId = meetingId;
        this.connId = connId;
    }

    public String getMessageName() {
        return "CloseConnectionMsg";
    }
}
