package org.bigbluebutton.api.messaging.messages;

import java.util.HashMap;

public class PositionInWaitingQueueUpdated implements IMessage {
    public final String meetingId;
    public final HashMap guests;

    public PositionInWaitingQueueUpdated(String meetingId, HashMap<String,String> guests) {
        this.meetingId = meetingId;
        this.guests = guests;
    }
}
