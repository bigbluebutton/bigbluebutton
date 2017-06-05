package org.bigbluebutton.messages;

public class ValidateAuthTokenRequestTimedoutPayload {
    public final String meetingId;
    public final String userId;
    public final String token;

    public ValidateAuthTokenRequestTimedoutPayload(String meetingId, String userId, String token) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.token = token;
    }
}
