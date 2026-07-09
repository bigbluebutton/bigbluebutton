package org.bigbluebutton.presentation.messages;

import java.util.Map;

public class DocPagesInsertedProgress implements IDocConversionMsg {
  public final String podId;
  public final String meetingId;
  public final String targetPresentationId;
  public final String insertPresentationId;
  public final Integer insertAtPosition;
  public final Integer totalPagesAfter;
  public final String presBaseUrl;
  // 1-based page number to pageId of the inserted presentation's pages.
  public final Map<Integer, String> insertPageIds;

  public DocPagesInsertedProgress(String podId, String meetingId, String targetPresentationId,
                                  String insertPresentationId, Integer insertAtPosition,
                                  Integer totalPagesAfter, String presBaseUrl,
                                  Map<Integer, String> insertPageIds) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.targetPresentationId = targetPresentationId;
    this.insertPresentationId = insertPresentationId;
    this.insertAtPosition = insertAtPosition;
    this.totalPagesAfter = totalPagesAfter;
    this.presBaseUrl = presBaseUrl;
    this.insertPageIds = insertPageIds;
  }
}
