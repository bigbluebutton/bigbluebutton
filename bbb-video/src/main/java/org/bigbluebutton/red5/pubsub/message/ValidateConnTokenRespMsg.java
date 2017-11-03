package org.bigbluebutton.red5.pubsub.message;

public class ValidateConnTokenRespMsg implements ClientMessage {

    public final String meetingId;
    public final String connId;
    public final String userId;
    public final Boolean authzed;

    public ValidateConnTokenRespMsg(String meetingId, String userId, Boolean authzed, String connId) {
        this.meetingId = meetingId;
        this.connId = connId;
        this.authzed = authzed;
        this.userId = userId;
    }

    public String getMessageName() {
        return "ValidateConnTokenRespMsg";
    }
}
