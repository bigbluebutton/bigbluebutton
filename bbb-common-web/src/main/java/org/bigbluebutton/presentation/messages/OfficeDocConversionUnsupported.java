package org.bigbluebutton.presentation.messages;


import org.bigbluebutton.api.messaging.messages.IMessage;

public class OfficeDocConversionUnsupported implements IMessage{
  public final String podId;
  public final String meetingId;
  public final String presId;
  public final String presInstance;
  public final String filename;
  public final String uploaderId;
  public final String authzToken;
  public final Boolean downloadable;

  public OfficeDocConversionUnsupported(String podId, String meetingId, String presId, String presInstance,
                                        String filename, String uploaderId, String authzToken,
                                        Boolean downloadable) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.presId = presId;
    this.presInstance = presInstance;
    this.filename = filename;
    this.uploaderId = uploaderId;
    this.authzToken = authzToken;
    this.downloadable = downloadable;
  }
}
