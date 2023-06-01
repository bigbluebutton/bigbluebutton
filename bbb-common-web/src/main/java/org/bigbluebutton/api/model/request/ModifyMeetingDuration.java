package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.IsIntegralConstraint;
import org.bigbluebutton.api.model.constraint.MeetingExistsConstraint;
import org.bigbluebutton.api.model.constraint.MeetingIDConstraint;
import org.bigbluebutton.api.model.shared.Checksum;

import java.util.Map;
import javax.validation.constraints.*;

public class ModifyMeetingDuration extends RequestWithChecksum<ModifyMeetingDuration.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID"),
        SECONDS("seconds");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    @MeetingExistsConstraint(key = "invalidMeetingIdentifier")
    private String meetingId;

    @IsIntegralConstraint
    @Min(value = -300, message = "Minimum value for seconds is -300")
    @Max(value = 300, message = "Maximum value for seconds is 300")
    private String secondsString;
    private Integer seconds;

    public ModifyMeetingDuration(Checksum checksum) {
        super(checksum);
    }

    public String getMeetingId() {
        return meetingId;
    }

    public void setMeetingId(String meetingId) {
        this.meetingId = meetingId;
    }

    public String getSecondsString() {
        return secondsString;
    }

    public void setSecondsString(String secondsString) {
        this.secondsString = secondsString;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.MEETING_ID.getValue())) setMeetingId(params.get(Params.MEETING_ID.getValue())[0]);
        if(params.containsKey(Params.SECONDS.getValue())) setSecondsString(params.get(Params.SECONDS.getValue())[0]);
    }

    @Override
    public void convertParamsFromString() {
        if(secondsString != null) {
            seconds = Integer.parseInt(secondsString);
        }
    }
}
