package org.bigbluebutton.api.messaging.messages;

public class ActivityReport implements IMessage {
    public final String meetingId;
    public final String activityJson;

    public ActivityReport(String meetingId, String activityJson) {
        this.meetingId = meetingId;
        this.activityJson = activityJson;
    }
}
