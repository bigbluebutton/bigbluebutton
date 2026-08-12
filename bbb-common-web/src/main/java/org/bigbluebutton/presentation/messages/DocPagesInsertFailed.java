package org.bigbluebutton.presentation.messages;

public class DocPagesInsertFailed implements IDocConversionMsg {
  public final String podId;
  public final String meetingId;
  public final String targetPresentationId;
  public final String insertPresentationId;
  // Correlation id the requesting client sent with the insert, echoed back so that
  // client can tell whether this meeting-wide failure is the one it is waiting for.
  public final String insertRequestId;

  public DocPagesInsertFailed(String podId, String meetingId, String targetPresentationId,
                              String insertPresentationId, String insertRequestId) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.targetPresentationId = targetPresentationId;
    this.insertPresentationId = insertPresentationId;
    this.insertRequestId = insertRequestId;
  }
}
