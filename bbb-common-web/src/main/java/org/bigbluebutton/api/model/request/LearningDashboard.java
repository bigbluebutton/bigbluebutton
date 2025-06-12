package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.UserSessionConstraint;

import javax.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotNull;
import org.sitemesh.webapp.contentfilter.HttpServletRequestFilterable;

import java.util.Map;

public class LearningDashboard extends RequestWithSession<LearningDashboard.Params> {

    public enum Params implements RequestParameters {
        SESSION_TOKEN("sessionToken");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @UserSessionConstraint
    private String sessionToken;

    public LearningDashboard(HttpServletRequestFilterable servletRequest) {
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
        if(params.containsKey(LearningDashboard.Params.SESSION_TOKEN.getValue())) setSessionToken(params.get(LearningDashboard.Params.SESSION_TOKEN.getValue())[0]);
    }

    @Override
    public void convertParamsFromString() {

    }
}
