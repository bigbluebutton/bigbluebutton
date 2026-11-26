package org.bigbluebutton.presentation.messages;

/**
 * Emitted when the upload a token was issued for cannot complete: its request was refused after
 * the token was consumed, or no request arrived in time. Carried on the generic
 * PresentationConversionFailedErrorSysPubMsg envelope, as ConversionRateLimitExceeded is.
 */
public record PresentationUploadFailed(String podId, String meetingId, String presentationId,
                                       String filename, String messageKey,
                                       String errorDetail) implements IDocConversionMsg {
}
