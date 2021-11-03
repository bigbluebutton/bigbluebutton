package org.bigbluebutton.api.model.shared;

import org.bigbluebutton.api.model.constraint.ModeratorPasswordConstraint;

import javax.validation.constraints.NotEmpty;

@ModeratorPasswordConstraint(message = "Provided moderator password is incorrect")
public class ModeratorPassword {

    @NotEmpty(message = "You must provide the meeting ID")
    private String meetingID;

    @NotEmpty(message = "You must provide the password for the call")
    private String password;

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
}
