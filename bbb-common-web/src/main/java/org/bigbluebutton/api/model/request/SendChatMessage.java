package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.MeetingIDConstraint;
import org.bigbluebutton.api.model.constraint.MeetingNameConstraint;
import org.bigbluebutton.api.model.constraint.NotNull;
import org.bigbluebutton.api.model.constraint.Size;
import org.bigbluebutton.api.model.shared.Checksum;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

public class SendChatMessage extends RequestWithChecksum<SendChatMessage.Params> {

    public enum Params implements RequestParameters {
        MEETING_ID("meetingID"),
        USER_NAME("userName"),
        MESSAGE("message");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingIDConstraint
    private String meetingID;

    private String userName;

    @NotNull(message = "You must provide the param message")
    @Size(min = 1, max = 500, message = "Param message must be between 1 and 500 characters")
    private String message;

    public SendChatMessage(Checksum checksum, HttpServletRequest servletRequest) {
        super(checksum, servletRequest);
    }

    public String getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(String meetingID) {
        this.meetingID = meetingID;
    }

    @Size(max = 255, message = "Param userName must not exceed 255 characters")
    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }


    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(SendChatMessage.Params.MEETING_ID.getValue())) setMeetingID(params.get(SendChatMessage.Params.MEETING_ID.getValue())[0]);
        if(params.containsKey(SendChatMessage.Params.USER_NAME.getValue())) setUserName(params.get(Params.USER_NAME.getValue())[0]);
        if(params.containsKey(SendChatMessage.Params.MESSAGE.getValue())) setMessage(params.get(Params.MESSAGE.getValue())[0]);

    }
}