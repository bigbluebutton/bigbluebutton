package org.bigbluebutton.api.model.shared;

import jakarta.validation.constraints.NotEmpty;

public abstract class Password {

    @NotEmpty(message = "You must provide the meeting ID")
    protected String meetingID;

    protected String password;

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
