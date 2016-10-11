package org.bigbluebutton.messages.payload;

public class CreateBreakoutRoomRequestPayload {
    public final String breakoutMeetingId;
    public final String parentMeetingId; // The main meeting internal id
    public final String name; // The name of the breakout room
    public final String voiceConfId; // The voice conference id
    public final String viewerPassword;
    public final String moderatorPassword;
    public final Integer durationInMinutes; // The duration of the breakout room
    public final String sourcePresentationId;
    public final Integer sourcePresentationSlide;
    public final Boolean record;

    public CreateBreakoutRoomRequestPayload(String meetingMeetingId, String parentMeetingId,
            String name, String voiceConfId, String viewerPassword,
            String moderatorPassword, Integer duration,
            String sourcePresentationId, Integer sourcePresentationSlide,
            Boolean record) {
        this.breakoutMeetingId = meetingMeetingId;
        this.parentMeetingId = parentMeetingId;
        this.name = name;
        this.voiceConfId = voiceConfId;
        this.viewerPassword = viewerPassword;
        this.moderatorPassword = moderatorPassword;
        this.durationInMinutes = duration;
        this.sourcePresentationId = sourcePresentationId;
        this.sourcePresentationSlide = sourcePresentationSlide;
        this.record = record;
    }
}
