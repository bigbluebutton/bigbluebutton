package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.MeetingEndedConstraint;
import org.bigbluebutton.api.model.constraint.MeetingExistsConstraint;
import org.bigbluebutton.api.model.constraint.MeetingIDConstraint;
import org.bigbluebutton.api.model.shared.Checksum;

import java.util.Map;

public class EndPrompt  extends RequestWithChecksum<EndPrompt.Params>{

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    @MeetingExistsConstraint(key = "invalidMeetingIdentifier")
    private String meetingId;

    public EndPrompt(Checksum checksum) {
        super(checksum);
    }

    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.MEETING_ID.getValue())) setMeetingId(params.get(CreateMeeting.Params.MEETING_ID.getValue())[0]);
    }
}
