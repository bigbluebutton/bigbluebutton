package org.bigbluebutton.messages;


public class RegisterUserMessagePayload {
    public final String meetingId;
    public final String userId;
    public final String name;
    public final String role;
    public final String extUserId;
    public final String authToken;
    public final String avatarUrl;
    public final Boolean guest;
    public final Boolean authed;

    public RegisterUserMessagePayload(String meetingId, String userId, String name, String role,
                   String extUserId, String authToken, String avatarUrl, Boolean guest, Boolean authed) {
        this.meetingId = meetingId;
        this.userId = userId;
        this.name = name;
        this.role = role;
        this.extUserId = extUserId;
        this.authToken = authToken;
        this.avatarUrl = avatarUrl;
        this.guest = guest;
        this.authed = authed;
    }
}
