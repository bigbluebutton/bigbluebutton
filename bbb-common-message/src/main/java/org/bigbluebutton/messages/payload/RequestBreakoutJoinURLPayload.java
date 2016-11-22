package org.bigbluebutton.messages.payload;

public class RequestBreakoutJoinURLPayload {

    public final String meetingId;
    public final String breakoutMeetingId;
    public final String userId;

    public RequestBreakoutJoinURLPayload(String meetingId,
            String breakoutMeetingId, String userId) {
        this.meetingId = meetingId;
        this.breakoutMeetingId = breakoutMeetingId;
        this.userId = userId;
    }
}
