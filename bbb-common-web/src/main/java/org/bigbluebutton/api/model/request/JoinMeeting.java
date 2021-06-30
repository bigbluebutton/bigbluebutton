package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.MeetingEndedConstraint;
import org.bigbluebutton.api.model.constraint.MeetingExistsConstraint;
import org.bigbluebutton.api.model.constraint.MeetingIDConstraint;
import org.bigbluebutton.api.model.constraint.PasswordConstraint;
import org.bigbluebutton.api.model.shared.Checksum;

import javax.validation.constraints.NotEmpty;
import java.util.Map;

public class JoinMeeting extends RequestWithChecksum<JoinMeeting.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID"),
        USER_ID("userID"),
        FULL_NAME("fullName"),
        PASSWORD("password"),
        GUEST("guest"),
        AUTH("auth"),
        CREATE_TIME("createTime");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    @MeetingExistsConstraint
    @MeetingEndedConstraint
    private String meetingID;

    private String userID;

    @NotEmpty(message = "You must provide your name")
    private String fullName;

    @PasswordConstraint
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
        if(params.containsKey(Params.MEETING_ID.getValue())) {
            setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
        }

        if(params.containsKey(Params.USER_ID.getValue())) setUserID(params.get(Params.USER_ID.getValue())[0]);
        if(params.containsKey(Params.FULL_NAME.getValue())) setFullName(params.get(Params.FULL_NAME.getValue())[0]);
        if(params.containsKey(Params.PASSWORD.getValue())) setPassword(params.get(Params.PASSWORD.getValue())[0]);
        if(params.containsKey(Params.GUEST.getValue())) setGuest(Boolean.parseBoolean(params.get(Params.GUEST.getValue())[0]));
        if(params.containsKey(Params.AUTH.getValue())) setAuth(Boolean.parseBoolean(params.get(Params.AUTH.getValue())[0]));
        if(params.containsKey(Params.CREATE_TIME.getValue())) setCreateTime(Long.parseLong(params.get(Params.CREATE_TIME.getValue())[0]));
    }
}
