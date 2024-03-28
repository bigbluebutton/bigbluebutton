package org.bigbluebutton.api.messaging.messages;

public class WebcamsOnlyForModeratorChanged implements IMessage {
    public final String meetingId;
    public final Boolean webcamsOnlyForModerator;

    public WebcamsOnlyForModeratorChanged(String meetingId, Boolean webcamsOnlyForModerator) {
        this.meetingId = meetingId;
        this.webcamsOnlyForModerator = webcamsOnlyForModerator;
    }
}
