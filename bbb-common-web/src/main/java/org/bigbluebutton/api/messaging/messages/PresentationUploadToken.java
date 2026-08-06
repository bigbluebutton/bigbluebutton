package org.bigbluebutton.api.messaging.messages;

public class PresentationUploadToken implements IMessage  {
    // userId stamped on tokens bbb-apps-akka issues to the server itself rather than
    // on behalf of a participant. Participant ids are always prefixed and randomised.
    public static final String SYSTEM_USER_ID = "system";

    public final String podId;
    public final String presentationId;
    public final String authzToken;
    public final String filename;
    public final String meetingId;
    public final String userId;

    public PresentationUploadToken(String podId, String authzToken, String filename, String meetingId, String presentationId, String userId) {
        this.podId = podId;
        this.authzToken = authzToken;
        this.presentationId = presentationId;
        this.filename = filename;
        this.meetingId = meetingId;
        this.userId = userId;
    }

    public boolean isSystemUpload() {
        return SYSTEM_USER_ID.equals(userId);
    }
}
