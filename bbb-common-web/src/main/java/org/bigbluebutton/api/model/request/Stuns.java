package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.*;
import org.bigbluebutton.api.service.SessionService;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@ContentTypeConstraint
public class Stuns extends RequestWithSession<Stuns.Params> {

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

    public Stuns(HttpServletRequest servletRequest) {
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
        if(params.containsKey(Stuns.Params.SESSION_TOKEN.getValue())) {
            setSessionToken(params.get(Stuns.Params.SESSION_TOKEN.getValue())[0]);
            sessionService.setSessionToken(sessionToken);
            meetingID = sessionService.getMeetingID();
        }
    }

    @Override
    public void convertParamsFromString() {

    }

}
