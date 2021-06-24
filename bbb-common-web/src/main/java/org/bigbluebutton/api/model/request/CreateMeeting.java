package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.shared.Checksum;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.Map;

public class CreateMeeting extends Request {

    @NotEmpty(message = "You must provide a meeting name")
    @Size(min = 2, max = 256, message = "Meeting name must be between 2 and 256 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s!@#$%^&*()_\\-+=\\[\\]{};:.'\"<>?\\\\|\\/]+$", message = "Meeting name cannot contain ','")
    private String name;

    @NotEmpty(message = "You must provide a meeting ID")
    @Size(min = 2, max = 256, message = "Meeting ID must be between 2 and 256 characters")
    @Pattern(regexp = "^[a-zA-Z0-9\\s!@#$%^&*()_\\-+=\\[\\]{};:.'\"<>?\\\\|\\/]+$", message = "Meeting ID cannot contain ','")
    private String meetingID;

    @NotEmpty(message = "You must provide a voice bridge")
    private String voiceBridge;

    @NotEmpty(message = "You must provide an attendee password")
    private String attendeePW;

    @NotEmpty(message = "You must provide a moderator password")
    private String moderatorPW;

    @NotNull(message = "You must provide whether this meeting is breakout room")
    private Boolean isBreakoutRoom;

    @NotNull(message = "You must provide whether to record this meeting")
    private Boolean record;

    public CreateMeeting(Checksum checksum) {
        super(checksum);
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMeetingID() {
        return meetingID;
    }

    public void setMeetingID(String meetingID) {
        this.meetingID = meetingID;
    }

    public String getVoiceBridge() {
        return voiceBridge;
    }

    public void setVoiceBridge(String voiceBridge) {
        this.voiceBridge = voiceBridge;
    }

    public String getAttendeePW() {
        return attendeePW;
    }

    public void setAttendeePW(String attendeePW) {
        this.attendeePW = attendeePW;
    }

    public String getModeratorPW() {
        return moderatorPW;
    }

    public void setModeratorPW(String moderatorPW) {
        this.moderatorPW = moderatorPW;
    }

    public Boolean isBreakoutRoom() {
        return isBreakoutRoom;
    }

    public void setBreakoutRoom(boolean breakoutRoom) {
        isBreakoutRoom = breakoutRoom;
    }

    public Boolean isRecord() {
        return record;
    }

    public void setRecord(boolean record) {
        this.record = record;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey("name")) setName(params.get("name")[0]);
        if(params.containsKey("meetingID")) setMeetingID(params.get("meetingID")[0]);
        if(params.containsKey("voiceBridge")) setVoiceBridge(params.get("voiceBridge")[0]);
        if(params.containsKey("attendeePW")) setAttendeePW(params.get("attendeePW")[0]);
        if(params.containsKey("moderatorPW")) setModeratorPW(params.get("moderatorPW")[0]);
        if(params.containsKey("isBreakoutRoom")) setBreakoutRoom(Boolean.parseBoolean(params.get("isBreakoutRoom")[0]));
        if(params.containsKey("record")) setRecord(Boolean.parseBoolean(params.get("record")[0]));
    }
}
