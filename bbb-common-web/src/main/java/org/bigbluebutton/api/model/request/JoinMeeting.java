package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.shared.Checksum;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.Map;

public class JoinMeeting extends Request {

    @NotEmpty(message = "You must provide a meeting ID")
    @Size(min = 2, max = 256, message = "Meeting ID must be between 2 and 256 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s!@#$%^&*()_\\-+=\\[\\]{};:.'\"<>?\\\\|\\/]+$", message = "Meeting name cannot contain ','")
    private String meetingID;

    private String userID;

    @NotEmpty(message = "You must provide your name")
    private String fullName;

    @NotEmpty(message = "You must provide your password")
    @Size(min = 2, max = 64, message = "Password must be between 8 and 20 characters")
    private String password;

    private Boolean guest;

    private Boolean auth;

    private Long createTime;

    public JoinMeeting(Checksum checksum) {
        super(checksum);
    }

    public String getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(String meetingID) {
        this.meetingID = meetingID;
    }

    public String getUserID() {
        return userID;
    }

    public void setUserID(String userID) {
        this.userID = userID;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Boolean getGuest() {
        return guest;
    }

    public void setGuest(Boolean guest) {
        this.guest = guest;
    }

    public Boolean getAuth() {
        return auth;
    }

    public void setAuth(Boolean auth) {
        this.auth = auth;
    }

    public Long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Long createTime) {
        this.createTime = createTime;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey("meetingID")) setMeetingID(params.get("meetingID")[0]);
        if(params.containsKey("userID")) setUserID(params.get("userID")[0]);
        if(params.containsKey("fullName")) setFullName(params.get("fullName")[0]);
        if(params.containsKey("password")) setPassword(params.get("password")[0]);
        if(params.containsKey("guest")) setGuest(Boolean.parseBoolean(params.get("guest")[0]));
        if(params.containsKey("auth")) setAuth(Boolean.parseBoolean(params.get("auth")[0]));
        if(params.containsKey("createTime")) setCreateTime(Long.parseLong(params.get("createTime")[0]));
    }
}
