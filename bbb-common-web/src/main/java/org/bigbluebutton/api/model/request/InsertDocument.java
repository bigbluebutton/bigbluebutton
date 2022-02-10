package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.*;
import org.bigbluebutton.api.model.shared.Checksum;

import java.util.Map;


public class InsertDocument extends RequestWithChecksum<InsertDocument.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    private String meetingID;

    public InsertDocument(Checksum checksum) {
        super(checksum);
    }

    public String getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(String meetingID) {
        this.meetingID = meetingID;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.MEETING_ID.getValue())) setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
    }
}
