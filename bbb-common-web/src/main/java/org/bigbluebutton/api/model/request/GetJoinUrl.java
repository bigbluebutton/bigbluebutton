package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.UserSessionConstraint;

import java.util.Map;

public class GetJoinUrl implements Request<GetJoinUrl.Params> {

    public enum Params implements RequestParameters {
        SESSION_TOKEN("sessionToken");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @UserSessionConstraint
    private String sessionToken;

    public String getSessionToken() {
        return sessionToken;
    }

    public void setSessionToken(String sessionToken) {
        this.sessionToken = sessionToken;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(GetJoinUrl.Params.SESSION_TOKEN.getValue())) setSessionToken(params.get(GetJoinUrl.Params.SESSION_TOKEN.getValue())[0]);
    }

    @Override
    public void convertParamsFromString() {

    }
}