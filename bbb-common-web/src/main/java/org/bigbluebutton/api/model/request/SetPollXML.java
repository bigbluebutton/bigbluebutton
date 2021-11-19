package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.MeetingExistsConstraint;
import org.bigbluebutton.api.model.constraint.MeetingIDConstraint;
import org.bigbluebutton.api.model.constraint.NotEmpty;
import org.bigbluebutton.api.model.shared.Checksum;

import java.util.Map;

public class SetPollXML extends RequestWithChecksum<SetPollXML.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID"),
        POLL_XML("pollXML");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    @MeetingExistsConstraint(key = "invalidMeetingIdentifier")
    private String meetingID;

    @NotEmpty(key = "configXMLError", message = "You did not pass a poll XML")
    private String pollXML;

    public SetPollXML(Checksum checksum) {
        super(checksum);
    }

    public String getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(String meetingID) {
        this.meetingID = meetingID;
    }

    public String getPollXML() {
        return pollXML;
    }

    public void setPollXML(String pollXML) {
        this.pollXML = pollXML;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.MEETING_ID.getValue())) {
            setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
        }

        if(params.containsKey(Params.POLL_XML.getValue())) setPollXML(params.get(Params.POLL_XML.getValue())[0]);
    }
}
