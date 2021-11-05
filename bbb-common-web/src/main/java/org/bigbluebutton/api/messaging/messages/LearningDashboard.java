package org.bigbluebutton.api.messaging.messages;

public class LearningDashboard implements IMessage {
    public final String meetingId;
    public final String activityJson;

    public LearningDashboard(String meetingId, String activityJson) {
        this.meetingId = meetingId;
        this.activityJson = activityJson;
    }
}
