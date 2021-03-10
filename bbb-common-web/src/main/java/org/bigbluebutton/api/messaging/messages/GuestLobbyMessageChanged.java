package org.bigbluebutton.api.messaging.messages;

public class GuestLobbyMessageChanged implements IMessage {
    public final String meetingId;
    public final String message;

    public GuestLobbyMessageChanged(String meetingId, String message) {
        this.meetingId = meetingId;
        this.message = message;
    }
}
