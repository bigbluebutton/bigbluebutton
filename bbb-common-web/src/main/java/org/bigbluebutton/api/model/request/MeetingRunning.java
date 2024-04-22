package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.ContentTypeConstraint;
import org.bigbluebutton.api.model.constraint.MeetingIDConstraint;
import org.bigbluebutton.api.model.shared.Checksum;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@ContentTypeConstraint
public class MeetingRunning extends RequestWithChecksum<MeetingRunning.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    private String meetingID;

    public MeetingRunning(Checksum checksum, HttpServletRequest servletRequest) {
        super(checksum, servletRequest);
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
