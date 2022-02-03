package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.*;
import org.bigbluebutton.api.model.shared.Checksum;

import java.util.Map;


public class InsertDocument extends RequestWithChecksum<InsertDocument.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID"),
        PASSWORD("password");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    private String meetingID;

    @PasswordConstraint
    private String password;

    public InsertDocument(Checksum checksum) {
        super(checksum);
    }

    public String getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(String meetingID) {
        this.meetingID = meetingID;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.MEETING_ID.getValue())) setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
        if(params.containsKey(Params.PASSWORD.getValue())) setPassword(params.get(Params.PASSWORD.getValue())[0]);
    }
}
