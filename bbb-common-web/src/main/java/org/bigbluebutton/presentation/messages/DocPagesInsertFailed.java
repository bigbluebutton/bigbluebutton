package org.bigbluebutton.presentation.messages;

public class DocPagesInsertFailed implements IDocConversionMsg {
  public final String podId;
  public final String meetingId;
  public final String targetPresentationId;
  public final String insertPresentationId;

  public DocPagesInsertFailed(String podId, String meetingId, String targetPresentationId,
                              String insertPresentationId) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.targetPresentationId = targetPresentationId;
    this.insertPresentationId = insertPresentationId;
  }
}
