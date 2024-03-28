package org.bigbluebutton.api.messaging.messages;

public class LockSettingsChanged implements IMessage {

    public final String meetingId;
    public final Boolean disableCam;
    public final Boolean disableMic;
    public final Boolean disablePrivateChat;
    public final Boolean disablePublicChat;
    public final Boolean disableNotes;
    public final Boolean hideUserList;
    public final Boolean lockOnJoin;
    public final Boolean lockOnJoinConfigurable;
    public final Boolean hideViewersCursor;
    public final Boolean hideViewersAnnotation;

    public LockSettingsChanged(String meetingId,
                               Boolean disableCam,
                               Boolean disableMic,
                               Boolean disablePrivateChat,
                               Boolean disablePublicChat,
                               Boolean disableNotes,
                               Boolean hideUserList,
                               Boolean lockOnJoin,
                               Boolean lockOnJoinConfigurable,
                               Boolean hideViewersCursor,
                               Boolean hideViewersAnnotation) {
        this.meetingId = meetingId;
        this.disableCam = disableCam;
        this.disableMic = disableMic;
        this.disablePrivateChat = disablePrivateChat;
        this.disablePublicChat = disablePublicChat;
        this.disableNotes = disableNotes;
        this.hideUserList = hideUserList;
        this.lockOnJoin = lockOnJoin;
        this.lockOnJoinConfigurable = lockOnJoinConfigurable;
        this.hideViewersCursor = hideViewersCursor;
        this.hideViewersAnnotation = hideViewersAnnotation;
    }
}
