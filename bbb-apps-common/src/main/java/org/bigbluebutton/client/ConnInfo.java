package org.bigbluebutton.client;


public class ConnInfo {
    public final String meetingId;
    public final String userId;
    public final String token;
    public final String connId;
    public final String sessionId;

    public ConnInfo(String meetingId, String userId, String token,
                    String connId, String sessionId) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.token = token;
        this.connId = connId;
        this.sessionId = sessionId;

    }
}
