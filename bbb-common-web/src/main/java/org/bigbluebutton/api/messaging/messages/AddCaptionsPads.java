package org.bigbluebutton.api.messaging.messages;

public class AddCaptionsPads implements IMessage {
    public final String meetingId;
    public final String[] padIds;

    public AddCaptionsPads(String meetingId, String[] padIds) {
        this.meetingId = meetingId;
        this.padIds = padIds;
    }
}
