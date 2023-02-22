package org.bigbluebutton.presentation.messages;

public class PresentationDisabled implements IDocConversionMsg{

    public final String meetingId;
    public final String temporaryPresentationId;
    public final String filename;
    public final String messageKey;
    public final String message;

    public PresentationDisabled( String temporaryPresentationId,
                                    String filename, String meetingId,
                                    String messageKey, String message) {
        this.meetingId = meetingId;
        this.temporaryPresentationId = temporaryPresentationId;
        this.filename = filename;
        this.message = message;
        this.messageKey = messageKey;


    }
}
