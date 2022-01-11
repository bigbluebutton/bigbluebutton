package org.bigbluebutton.api.messaging.messages;

public class AddNotifyWaitingTime implements IMessage {
    public final String meetingId;
    public final String guestId;
    public final String arrivalTime;

    public AddNotifyWaitingTime(String meetingId, String guestId, String arrivalTime) {
        this.meetingId = meetingId;
        this.guestId = guestId;
        this.arrivalTime = arrivalTime;
    }
}
