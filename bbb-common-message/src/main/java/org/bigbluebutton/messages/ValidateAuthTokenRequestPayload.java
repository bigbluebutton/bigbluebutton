package org.bigbluebutton.messages;

public class ValidateAuthTokenRequestPayload {
    public final String meetingId;
    public final String userId;
    public final String token;

    public ValidateAuthTokenRequestPayload(String meetingId, String userId, String token) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.token = token;
    }
}
