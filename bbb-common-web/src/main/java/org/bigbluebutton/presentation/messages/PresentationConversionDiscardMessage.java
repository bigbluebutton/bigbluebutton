package org.bigbluebutton.presentation.messages;

// Stop tracking a presentation whose conversion was rejected before all its pages were scheduled.
public class PresentationConversionDiscardMessage implements IPresentationCompletionMessage {
    public final String presId;
    public final String meetingId;

    public PresentationConversionDiscardMessage(String presId, String meetingId) {
        this.presId = presId;
        this.meetingId = meetingId;
    }
}
