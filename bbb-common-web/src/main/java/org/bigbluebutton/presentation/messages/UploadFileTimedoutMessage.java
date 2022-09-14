package org.bigbluebutton.presentation.messages;

public class UploadFileTimedoutMessage implements IDocConversionMsg {
  public final String podId;
  public final String meetingId;
  public final String filename;
  public final int page;
  public final String messageKey;
  public final String temporaryPresentationId;
  public final String presentationId;
  public final int convPdfToSvgTimeout;

  public UploadFileTimedoutMessage(String podId,
                                   String meetingId,
                                   String filename,
                                   String messageKey,
                                   int page,
                                   String temporaryPresentationId,
                                   String presentationId,
                                   int convPdfToSvgTimeout) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.temporaryPresentationId = temporaryPresentationId;
    this.filename = filename;
    this.messageKey = messageKey;
    this.page = page;
    this.presentationId = presentationId;
    this.convPdfToSvgTimeout = convPdfToSvgTimeout;
  }
}
