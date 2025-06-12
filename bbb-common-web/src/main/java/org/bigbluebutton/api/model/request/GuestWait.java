package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.ContentTypeConstraint;
import org.bigbluebutton.api.model.constraint.MeetingEndedConstraint;
import org.bigbluebutton.api.model.constraint.MeetingExistsConstraint;
import org.bigbluebutton.api.model.constraint.UserSessionConstraint;
import org.bigbluebutton.api.service.SessionService;

import javax.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotNull;
import org.sitemesh.webapp.contentfilter.HttpServletRequestFilterable;

import java.util.Map;

@ContentTypeConstraint
public class GuestWait extends RequestWithSession<GuestWait.Params>{

    public enum Params implements RequestParameters {
        SESSION_TOKEN("sessionToken");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @UserSessionConstraint
    private String sessionToken;

    @MeetingExistsConstraint
    @MeetingEndedConstraint
    private String meetingID;

    private SessionService sessionService;

    public GuestWait(HttpServletRequestFilterable servletRequest) {
        super(servletRequest);
        sessionService = new SessionService();
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.SESSION_TOKEN.getValue())) {
            setSessionToken(params.get(Params.SESSION_TOKEN.getValue())[0]);
            sessionService.setSessionToken(sessionToken);
            meetingID = sessionService.getMeetingID();
        }
    }

    @Override
    public void convertParamsFromString() {

    }
}
