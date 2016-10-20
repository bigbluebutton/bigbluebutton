package org.bigbluebutton.messages.payload;

public class BreakoutRoomsTimeRemainingPayload {

    public final String meetingId;
    public final Integer timeRemaining;

    public BreakoutRoomsTimeRemainingPayload(String meetingId,
            Integer timeRemaining) {
        this.meetingId = meetingId;
        this.timeRemaining = timeRemaining;
    }
}
