package org.bigbluebutton.messages;


import org.bigbluebutton.common.messages.IBigBlueButtonMessage;

public class RegisterUserMessage implements IBigBlueButtonMessage {
    public static final String NAME = "register_user_request";

    public final Header header;
    public final RegisterUserMessagePayload payload;

    public RegisterUserMessage(RegisterUserMessagePayload payload) {
        header = new Header(NAME);
        this.payload = payload;
    }


    public static class RegisterUserMessagePayload {
        public final String meetingID;
        public final String internalUserId;
        public final String fullname;
        public final String role;
        public final String externUserID;
        public final String authToken;
        public final String avatarURL;
        public final Boolean guest;
        public final Boolean authenticated;

        public RegisterUserMessagePayload(String meetingID, String internalUserId, String fullname, String role,
                                          String externUserID, String authToken, String avatarURL,
                                          Boolean guest, Boolean authenticated) {
            this.meetingID = meetingID;
            this.internalUserId = internalUserId;
            this.fullname = fullname;
            this.role = role;
            this.externUserID = externUserID;
            this.authToken = authToken;
            this.avatarURL = avatarURL;
            this.guest = guest;
            this.authenticated = authenticated;
        }
    }

}
