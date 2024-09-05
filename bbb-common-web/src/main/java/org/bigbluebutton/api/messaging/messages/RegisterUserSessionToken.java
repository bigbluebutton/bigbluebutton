package org.bigbluebutton.api.messaging.messages;

public class RegisterUserSessionToken implements IMessage {

    public final String meetingID;
    public final String internalUserId;
    public final String sessionToken;
    public final String revokeSessionToken;

    public RegisterUserSessionToken(String meetingID, String internalUserId, String sessionToken, String revokeSessionToken) {
        this.meetingID = meetingID;
        this.internalUserId = internalUserId;
        this.sessionToken = sessionToken;
        this.revokeSessionToken = revokeSessionToken;
    }
}