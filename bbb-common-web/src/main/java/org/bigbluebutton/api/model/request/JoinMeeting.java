package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.*;
import org.bigbluebutton.api.model.shared.Checksum;
import org.bigbluebutton.api.model.shared.JoinPassword;
import org.bigbluebutton.api.model.shared.Password;

import javax.validation.Valid;
import java.util.Map;

public class JoinMeeting extends RequestWithChecksum<JoinMeeting.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID"),
        USER_ID("userID"),
        FULL_NAME("fullName"),
        PASSWORD("password"),
        GUEST("guest"),
        AUTH("auth"),
        CREATE_TIME("createTime"),
        ROLE("role");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    @MeetingExistsConstraint(key = "invalidMeetingIdentifier")
    @MeetingEndedConstraint
    private String meetingID;

    private String userID;

    @NotEmpty(key = "missingParamFullName", message = "You must provide your name")
    private String fullName;

    @PasswordConstraint
    private String password;

    @IsBooleanConstraint(message = "Guest must be a boolean value (true or false)")
    private String guestString;
    private Boolean guest;

    @IsBooleanConstraint(message = "Auth must be a boolean value (true or false)")
    private String authString;
    private Boolean auth;

    @IsIntegralConstraint
    private String createTimeString;
    private Long createTime;

    private String role;

    @Valid
    private Password joinPassword;

    public JoinMeeting(Checksum checksum) {
        super(checksum);
        joinPassword = new JoinPassword();
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

    public void setGuestString(String guestString) { this.guestString = guestString; }

    public Boolean getGuest() {
        return guest;
    }

    public void setGuest(Boolean guest) {
        this.guest = guest;
    }

    public void setAuthString(String authString) { this.authString = authString; }

    public Boolean getAuth() {
        return auth;
    }

    public void setAuth(Boolean auth) {
        this.auth = auth;
    }

    public void setCreateTimeString(String createTimeString) { this.createTimeString = createTimeString; }

    public Long getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Long createTime) {
        this.createTime = createTime;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.MEETING_ID.getValue())) {
            setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
            joinPassword.setMeetingID(meetingID);
        }

        if(params.containsKey(Params.USER_ID.getValue())) setUserID(params.get(Params.USER_ID.getValue())[0]);
        if(params.containsKey(Params.FULL_NAME.getValue())) setFullName(params.get(Params.FULL_NAME.getValue())[0]);

        if(params.containsKey(Params.PASSWORD.getValue())) {
            setPassword(params.get(Params.PASSWORD.getValue())[0]);
            joinPassword.setPassword(password);
        }


        if(params.containsKey(Params.GUEST.getValue())) setGuestString(params.get(Params.GUEST.getValue())[0]);
        if(params.containsKey(Params.AUTH.getValue())) setAuthString(params.get(Params.AUTH.getValue())[0]);
        if(params.containsKey(Params.CREATE_TIME.getValue())) setCreateTimeString(params.get(Params.CREATE_TIME.getValue())[0]);
        if(params.containsKey(Params.ROLE.getValue())) setRole(params.get(Params.ROLE.getValue())[0]);
    }

    @Override
    public void convertParamsFromString() {
        guest = Boolean.parseBoolean(guestString);
        auth = Boolean.parseBoolean(authString);

        if(createTimeString != null) {
            createTime = Long.parseLong(createTimeString);
        }
    }
}
