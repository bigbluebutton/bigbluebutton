package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.UserSessionConstraint;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

public class Feedback extends RequestWithSession<Feedback.Params> {

    public enum Params implements RequestParameters {
        SESSION_TOKEN("sessionToken");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @UserSessionConstraint
    private String sessionToken;

    public Feedback(HttpServletRequest servletRequest) {
        super(servletRequest);
    }

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Feedback.Params.SESSION_TOKEN.getValue())) setSessionToken(params.get(Feedback.Params.SESSION_TOKEN.getValue())[0]);
    }

    @Override
    public void convertParamsFromString() {

    }
}