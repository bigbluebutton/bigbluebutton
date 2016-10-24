package org.bigbluebutton.messages.payload;

public class ListenInOnBreakoutPayload {

    public final String meetingId;
    public final String targetMeetingId;
    public final String userId;

    public ListenInOnBreakoutPayload(String meetingId, String targetMeetingId,
            String userId) {
        this.meetingId = meetingId;
        this.targetMeetingId = targetMeetingId;
        this.userId = userId;
    }
}
