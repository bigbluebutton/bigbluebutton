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

    // An upload request is authorized when it arrives but handled only once its whole body is
    // in, so until then the authorization is the only sign that the file is on its way.
    private final long receivedAt = System.currentTimeMillis();
    private volatile boolean uploadStarted = false;

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

    public void markUploadStarted() {
        uploadStarted = true;
    }

    // True once no upload request has arrived for the token within the time a client is given
    // to start sending. bbb-apps-akka issues the token of a system upload well before the file
    // is rendered, so those are never abandoned.
    public boolean isAbandoned(long now, long startTimeoutMillis) {
        return !isSystemUpload() && !uploadStarted && now - receivedAt >= startTimeoutMillis;
    }

    public boolean isValidFor(String requestedMeetingId) {
        return meetingId != null && meetingId.equals(requestedMeetingId);
    }
}
