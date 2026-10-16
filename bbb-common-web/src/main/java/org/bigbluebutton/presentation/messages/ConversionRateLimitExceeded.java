package org.bigbluebutton.presentation.messages;

/**
 * Emitted when a presentation is refused entry to the conversion pipeline by the per-meeting
 * conversion rate limit. Carried on the generic PresentationConversionFailedErrorSysPubMsg
 * envelope, so no dedicated message type is needed downstream.
 */
public record ConversionRateLimitExceeded(String podId, String meetingId, String presentationId,
                                          String filename, String messageKey,
                                          String errorDetail) implements IDocConversionMsg {
}
