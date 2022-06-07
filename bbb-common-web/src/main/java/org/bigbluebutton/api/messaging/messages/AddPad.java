package org.bigbluebutton.api.messaging.messages;

public class AddPad implements IMessage {
    public final String meetingId;
    public final String padId;
    public final String readOnlyId;

    public AddPad(String meetingId, String padId, String readOnlyId) {
        this.meetingId = meetingId;
        this.padId = padId;
        this.readOnlyId = readOnlyId;
    }
}
