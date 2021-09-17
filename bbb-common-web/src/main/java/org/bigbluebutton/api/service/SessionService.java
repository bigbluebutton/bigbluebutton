package org.bigbluebutton.api.service;

import org.bigbluebutton.api.MeetingService;
import org.bigbluebutton.api.domain.UserSession;

public class SessionService {

    private String sessionToken;
    private UserSession userSession;
    private MeetingService meetingService;

    public SessionService() {
        meetingService = ServiceUtils.getMeetingService();
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
        getUserSessionWithToken();
    }

    public String getSessionToken() { return sessionToken; }

    private void getUserSessionWithToken() {
        if(sessionToken != null) {
            userSession = meetingService.getUserSessionWithAuthToken(sessionToken);
        }
    }

    public String getMeetingID() {
        if(userSession != null) {
            return userSession.meetingID;
        }
        return "";
    }
}
