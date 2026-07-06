package org.bigbluebutton.presentation.messages;

public class DocPagesInsertedProgress implements IDocConversionMsg {
  public final String podId;
  public final String meetingId;
  public final String targetPresentationId;
  public final String insertPresentationId;
  public final Integer insertAtPosition;
  public final Integer totalPagesAfter;
  public final String presBaseUrl;

  public DocPagesInsertedProgress(String podId, String meetingId, String targetPresentationId,
                                  String insertPresentationId, Integer insertAtPosition,
                                  Integer totalPagesAfter, String presBaseUrl) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.targetPresentationId = targetPresentationId;
    this.insertPresentationId = insertPresentationId;
    this.insertAtPosition = insertAtPosition;
    this.totalPagesAfter = totalPagesAfter;
    this.presBaseUrl = presBaseUrl;
  }
}
