package org.bigbluebutton.presentation.messages;

public class OfficeToPdfConversionFailed implements IDocConversionMsg {
    public final String podId;
    public final String meetingId;
    public final String filename;
    public final String messageKey;
    public final String temporaryPresentationId;
    public final String presentationId;
    public final int maxNumberOfAttempts;

    public OfficeToPdfConversionFailed(String podId,
                                     String meetingId,
                                     String filename,
                                     String messageKey,
                                     String temporaryPresentationId,
                                     String presentationId,
                                     int maxNumberOfAttempts) {
        this.podId = podId;
        this.meetingId = meetingId;
        this.temporaryPresentationId = temporaryPresentationId;
        this.filename = filename;
        this.messageKey = messageKey;
        this.presentationId = presentationId;
        this.maxNumberOfAttempts = maxNumberOfAttempts;
    }

}
