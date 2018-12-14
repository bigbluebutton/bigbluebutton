package org.bigbluebutton.red5.client.messaging;


public class DirectToClientMsg implements ClientMessage{
    public final String meetingId;
    public final String connId;
    public final String json;
    public final String messageName;

    public DirectToClientMsg(String meetingId, String connId, String messageName, String json) {
        this.meetingId = meetingId;
        this.connId = connId;
        this.messageName = messageName;
        this.json = json;
    }

    public String getMessageName() {
        return messageName;
    }

}
