package org.bigbluebutton.presentation.messages;

import java.util.Map;

public class DocPageCompletedProgress implements IDocConversionMsg {
  public final String podId;
  public final String meetingId;
  public final String presId;
  public final String temporaryPresentationId;
  public final String presInstance;
  public final String filename;
  public final String uploaderId;
  public final String authzToken;
  public final Boolean downloadable;
  public final Boolean removable;
  public final String key;
  public final Integer numPages;
  public final String presBaseUrl;
  public final Boolean current;
  public final Boolean defaultPresentation;
  public final String filenameConverted;
  // Page number to pageId, as minted by the conversion pipeline.
  public final Map<Integer, String> pageIds;


  public DocPageCompletedProgress(String podId, String meetingId, String presId, String temporaryPresentationId, String presInstance,
                                  String filename, String uploaderId, String authzToken,
                                  Boolean downloadable, Boolean removable, String key,
                                  Integer numPages, String presBaseUrl, Boolean current,
                                  Boolean defaultPresentation, String filenameConverted,
                                  Map<Integer, String> pageIds) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.presId = presId;
    this.temporaryPresentationId = temporaryPresentationId;
    this.presInstance = presInstance;
    this.filename = filename;
    this.uploaderId = uploaderId;
    this.authzToken = authzToken;
    this.downloadable = downloadable;
    this.removable = removable;
    this.key = key;
    this.numPages = numPages;
    this.presBaseUrl = presBaseUrl;
    this.current = current;
    this.defaultPresentation = defaultPresentation;
    this.filenameConverted = filenameConverted;
    this.pageIds = pageIds;
  }
}
