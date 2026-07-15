package org.bigbluebutton.api.messaging.messages;

import java.util.ArrayList;
import java.util.Map;

public class CreateBreakoutRoom implements IMessage {

    public final String meetingId;
    public final String parentMeetingId; // The main meeting internal id
    public final String name; // The name of the breakout room
    public final Integer sequence; // The sequence number of the breakout room
    public final String shortName; // Name used in breakout rooms list
    public final String sharedNotesEditor; // Editor used for shared notes - blockNote or etherpad
    public final Boolean isDefaultName; // Inform if using default name or changed by moderator
    public final Boolean freeJoin; // Allow users to freely join the conference
                                   // in the client
    public final String dialNumber;
    public final String voiceConfId; // The voice conference id
    public final String viewerPassword;
    public final String moderatorPassword;
    public final Integer durationInSeconds; // The duration of the breakout room
    public final String sourcePresentationId;
    public final Integer sourcePresentationSlide;
    public final Boolean record;
    public final Boolean autoStartRecording;
    public final Boolean allowStartStopRecording;
    public final Boolean privateChatEnabled;
    public final Boolean captureNotes; // Upload shared notes to main room after breakout room end
    public final Boolean captureSlides; // Upload annotated breakout slides to main room after breakout room end
    public final String captureNotesFilename;
    public final String captureSlidesFilename;
    public final Map<String, Object> pluginProp;
    public final ArrayList<String> disabledFeatures;
    public final String audioBridge;
    public final String cameraBridge;
    public final String screenShareBridge;
    public final Boolean disablePrivChat;
    public final Boolean disableCam;
    public final Boolean disableMic;
    public final Boolean disablePubChat;
    public final Boolean disableNotes;
    public final Boolean hideUserList;
    public final Boolean lockOnJoin;
    public final Boolean lockOnJoinConfigurable;
    public final Boolean hideViewersCursor;
    public final Boolean hideViewersAnnotation;
    public final Boolean webcamsOnlyForModerator;

    public CreateBreakoutRoom(String meetingId,
                              String parentMeetingId,
                              String name,
                              Integer sequence,
                              String shortName,
                              String sharedNotesEditor,
                              Boolean isDefaultName,
                              Boolean freeJoin,
                              String dialNumber,
                              String voiceConfId,
                              String viewerPassword,
                              String moderatorPassword,
                              Integer duration,
                              String sourcePresentationId,
                              Integer sourcePresentationSlide,
                              Boolean record,
                              Boolean autoStartRecording,
                              Boolean allowStartStopRecording,
                              Boolean privateChatEnabled,
                              Boolean captureNotes,
                              Boolean captureSlides,
                              String captureNotesFilename,
                              String captureSlidesFilename,
                              Map<String, Object> pluginProp,
                              ArrayList<String> disabledFeatures,
                              String audioBridge,
                              String cameraBridge,
                              String screenShareBridge,
                              Boolean disablePrivChat,
                              Boolean disableCam,
                              Boolean disableMic,
                              Boolean disablePubChat,
                              Boolean disableNotes,
                              Boolean hideUserList,
                              Boolean lockOnJoin,
                              Boolean lockOnJoinConfigurable,
                              Boolean hideViewersCursor,
                              Boolean hideViewersAnnotation,
                              Boolean webcamsOnlyForModerator) {
        this.meetingId = meetingId;
        this.parentMeetingId = parentMeetingId;
        this.name = name;
        this.sequence = sequence;
        this.shortName = shortName;
        this.sharedNotesEditor = sharedNotesEditor;
        this.isDefaultName = isDefaultName;
        this.freeJoin = freeJoin;
        this.dialNumber = dialNumber;
        this.voiceConfId = voiceConfId;
        this.viewerPassword = viewerPassword;
        this.moderatorPassword = moderatorPassword;
        this.durationInSeconds = duration;
        this.sourcePresentationId = sourcePresentationId;
        this.sourcePresentationSlide = sourcePresentationSlide;
        this.record = record;
        this.autoStartRecording = autoStartRecording;
        this.allowStartStopRecording = allowStartStopRecording;
        this.privateChatEnabled = privateChatEnabled;
        this.captureNotes = captureNotes;
        this.captureSlides = captureSlides;
        this.captureNotesFilename = captureNotesFilename;
        this.captureSlidesFilename = captureSlidesFilename;
        this.pluginProp = pluginProp;
        this.disabledFeatures = disabledFeatures;
        this.audioBridge = audioBridge;
        this.cameraBridge = cameraBridge;
        this.screenShareBridge = screenShareBridge;
        this.disablePrivChat = disablePrivChat;
        this.disableCam = disableCam;
        this.disableMic = disableMic;
        this.disablePubChat = disablePubChat;
        this.disableNotes = disableNotes;
        this.hideUserList = hideUserList;
        this.lockOnJoin = lockOnJoin;
        this.lockOnJoinConfigurable = lockOnJoinConfigurable;
        this.hideViewersCursor = hideViewersCursor;
        this.hideViewersAnnotation = hideViewersAnnotation;
        this.webcamsOnlyForModerator = webcamsOnlyForModerator;
    }
}
