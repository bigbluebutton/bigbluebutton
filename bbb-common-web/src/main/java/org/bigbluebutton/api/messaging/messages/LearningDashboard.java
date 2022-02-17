package org.bigbluebutton.api.messaging.messages;

public class LearningDashboard implements IMessage {
    public final String meetingId;
    public final String activityJson;
    public final String learningDashboardAccessToken;

    public LearningDashboard(String meetingId, String learningDashboardAccessToken, String activityJson) {
        this.meetingId = meetingId;
        this.activityJson = activityJson;
        this.learningDashboardAccessToken = learningDashboardAccessToken;
    }
}
