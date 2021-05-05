package org.bigbluebutton.presentation.messages;

public class UploadFileTooLargeMessage implements IDocConversionMsg {
  public final String podId;
  public final String meetingId;
  public final String filename;
  public final String authzToken;
  public final String key;
  public final Integer uploadedFileSize;
  public final Integer maxUploadFileSize;

  public UploadFileTooLargeMessage(String podId,
                                   String meetingId,
                                   String filename,
                                   String authzToken,
                                   String key,
                                   Integer uploadedFileSize,
                                   Integer maxUploadFileSize) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.filename = filename;
    this.authzToken = authzToken;
    this.key = key;
    this.uploadedFileSize = uploadedFileSize;
    this.maxUploadFileSize = maxUploadFileSize;
  }
}
