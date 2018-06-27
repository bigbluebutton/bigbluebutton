package org.bigbluebutton.api.messaging.messages;

public class CreateBreakoutRoom implements IMessage {

    public final String meetingId;
    public final String parentMeetingId; // The main meeting internal id
    public final String name; // The name of the breakout room
    public final Integer sequence; // The sequence number of the breakout room
    public final Boolean freeJoin; // Allow users to freely join the conference in the client
    public final String voiceConfId; // The voice conference id
    public final String viewerPassword;
    public final String moderatorPassword;
    public final Integer durationInMinutes; // The duration of the breakout room
    public final String sourcePresentationId;
    public final Integer sourcePresentationSlide;
    public final Boolean record;

    public CreateBreakoutRoom(String meetingId, String parentMeetingId,
            String name, Integer sequence, Boolean freeJoin, String voiceConfId,
            String viewerPassword, String moderatorPassword, Integer duration,
            String sourcePresentationId, Integer sourcePresentationSlide,
            Boolean record) {
        this.meetingId = meetingId;
        this.parentMeetingId = parentMeetingId;
        this.name = name;
        this.sequence = sequence;
        this.freeJoin = freeJoin;
        this.voiceConfId = voiceConfId;
        this.viewerPassword = viewerPassword;
        this.moderatorPassword = moderatorPassword;
        this.durationInMinutes = duration;
        this.sourcePresentationId = sourcePresentationId;
        this.sourcePresentationSlide = sourcePresentationSlide;
        this.record = record;
    }
}
