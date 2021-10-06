package org.bigbluebutton.api.model.request;

import org.bigbluebutton.api.model.constraint.*;
import org.bigbluebutton.api.model.shared.Checksum;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.Map;

public class CreateMeeting extends RequestWithChecksum<CreateMeeting.Params> {

    public enum Params implements RequestParameters {
        NAME("name"),
        MEETING_ID("meetingID"),
        VOICE_BRIDGE("voiceBridge"),
        ATTENDEE_PW("attendeePW"),
        MODERATOR_PW("moderatorPW"),
        IS_BREAKOUT_ROOM("isBreakoutRoom"),
        RECORD("record");

        private final String value;

        Params(String value) { this.value = value; }

        public String getValue() { return value; }
    }

    @MeetingNameConstraint
    private String name;

    @MeetingIDConstraint
    private String meetingID;

    @IsIntegralConstraint(message = "Voice bridge must be an integral value")
    private String voiceBridgeString;
    private Integer voiceBridge;

    @PasswordConstraint
    private String attendeePW;

    @PasswordConstraint
    private String moderatorPW;

    //@NotEmpty(message = "You must provide whether this meeting is breakout room")
    @IsBooleanConstraint(message = "You must provide a boolean value (true or false) for the breakout room")
    private String isBreakoutRoomString;
    private Boolean isBreakoutRoom;

    //@NotEmpty(message = "You must provide whether to record this meeting")
    @IsBooleanConstraint(message = "Record must be a boolean value (true or false)")
    private String recordString;
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

    public String getVoiceBridgeString() {
        return voiceBridgeString;
    }

    public void setVoiceBridgeString(String voiceBridgeString) {
        this.voiceBridgeString = voiceBridgeString;
    }

    public Integer getVoiceBridge() { return voiceBridge; }

    public void setVoiceBridge(Integer voiceBridge) { this.voiceBridge = voiceBridge; }

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

    public void setBreakoutRoomString(String breakoutRoomString) { isBreakoutRoomString = breakoutRoomString; }

    public Boolean isBreakoutRoom() {
        return isBreakoutRoom;
    }

    public void setBreakoutRoom(boolean breakoutRoom) {
        isBreakoutRoom = breakoutRoom;
    }

    public void setRecordString(String recordString) { this.recordString = recordString; }

    public Boolean isRecord() {
        return record;
    }

    public void setRecord(boolean record) {
        this.record = record;
    }

    @Override
    public void populateFromParamsMap(Map<String, String[]> params) {
        if(params.containsKey(Params.NAME.getValue())) setName(params.get(Params.NAME.getValue())[0]);
        if(params.containsKey(Params.MEETING_ID.getValue())) setMeetingID(params.get(Params.MEETING_ID.getValue())[0]);
        if(params.containsKey(Params.VOICE_BRIDGE.getValue())) setVoiceBridgeString(params.get(Params.VOICE_BRIDGE.getValue())[0]);
        if(params.containsKey(Params.ATTENDEE_PW.getValue())) setAttendeePW(params.get(Params.ATTENDEE_PW.getValue())[0]);
        if(params.containsKey(Params.MODERATOR_PW.getValue())) setModeratorPW(params.get(Params.MODERATOR_PW.getValue())[0]);
        if(params.containsKey(Params.IS_BREAKOUT_ROOM.getValue())) setBreakoutRoomString(params.get(Params.IS_BREAKOUT_ROOM.value)[0]);
        if(params.containsKey(Params.RECORD.getValue())) setRecordString(params.get(Params.RECORD.getValue())[0]);
    }

    @Override
    public void convertParamsFromString() {
        if (voiceBridge != null) {
            voiceBridge = Integer.parseInt(voiceBridgeString);
        }
        isBreakoutRoom = Boolean.parseBoolean(isBreakoutRoomString);
        record = Boolean.parseBoolean(recordString);
    }
}
