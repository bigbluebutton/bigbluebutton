package org.bigbluebutton.presentation.messages;

public record UploadConversionCancelledMessage(String podId, String meetingId, String fileName, String messageKey,
                                               String temporaryPresentationId,
                                               String presentationId, long maxConversionTime) implements IDocConversionMsg {
}
