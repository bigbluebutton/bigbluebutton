package org.bigbluebutton.messages;


public class ValidateAuthTokenReplyPayload {
    public final String meetingId;
    public final String userId;
    public final String token;
    public final Boolean valid;

    public ValidateAuthTokenReplyPayload(String meetingId, String userId, String token, Boolean valid) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.token = token;
        this.valid = valid;
    }
}
