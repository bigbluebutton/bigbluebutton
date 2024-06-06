package org.bigbluebutton.api.messaging.messages;

public class PrivateGuestLobbyMessageChanged implements IMessage {
    public final String meetingId;
    public final String message;
    public final String guestId;

    public PrivateGuestLobbyMessageChanged(String meetingId, String guestId, String message) {
        this.meetingId = meetingId;
        this.guestId = guestId;
        this.message = message;
    }
}
