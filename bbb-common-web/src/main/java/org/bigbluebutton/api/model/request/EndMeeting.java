package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.MeetingExistsConstraint;
import org.bigbluebutton.api.model.constraint.MeetingIDConstraint;
import org.bigbluebutton.api.model.constraint.NotEmpty;
import org.bigbluebutton.api.model.constraint.PasswordConstraint;
import org.bigbluebutton.api.model.shared.Checksum;
import org.bigbluebutton.api.model.shared.ModeratorPassword;
import org.bigbluebutton.api.model.shared.Password;

import javax.validation.Valid;
import java.util.Map;

public class EndMeeting extends RequestWithChecksum<EndMeeting.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID"),
        PASSWORD("password");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    @MeetingExistsConstraint
    private String meetingID;

    @PasswordConstraint
    private String password;

    @Valid
    private Password moderatorPassword;

    public EndMeeting(Checksum checksum) {
        super(checksum);
        moderatorPassword = new ModeratorPassword();
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
        if(params.containsKey(Params.MEETING_ID.getValue())) {
            setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
            moderatorPassword.setMeetingID(meetingID);
        }

        if(params.containsKey(Params.PASSWORD.getValue())) {
            setPassword(params.get(Params.PASSWORD.getValue())[0]);
            moderatorPassword.setPassword(password);
        }
    }
}
