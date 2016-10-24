package org.bigbluebutton.messages.payload;

public class BreakoutRoomPayload {

    public final String parentMeetingId;
    public final String meetingId;
    public final String externalMeetingId;
    public final String name;
    public final Integer sequence;

    public BreakoutRoomPayload(String parentMeetingId, String meetingId,
            String externalMeetingId, String name, Integer sequence) {
        this.parentMeetingId = parentMeetingId;
        this.meetingId = meetingId;
        this.externalMeetingId = externalMeetingId;
        this.name = name;
        this.sequence = sequence;
    }
}
