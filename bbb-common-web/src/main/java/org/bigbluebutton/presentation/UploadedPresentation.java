/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/

package org.bigbluebutton.presentation;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import org.apache.commons.io.FilenameUtils;

public final class UploadedPresentation {
  private final String podId;
  private final String meetingId;
  private final String id;
  private final String temporaryPresentationId;
  private final String name;
  private final boolean uploadFailed;
  private final ArrayList<String> uploadFailReason;
  private File uploadedFile;
  private String uploadedFileHash;
  private String fileType = "unknown";
  private int numberOfPages = 0;
  private String conversionStatus;
  private String filenameConverted;
  private final String baseUrl;
  private boolean isDownloadable = false;
  private boolean isRemovable = true;
  private boolean current = false;
  private String authzToken;
  private boolean conversionStarted = false;
  private long maxPageConversionTime;

  private boolean defaultPresentation;
  private boolean systemUpload = false;
  // Page ids of this upload, in page order. Registered once: minted, or adopted from the conversion cache.
  private volatile List<String> pageIds = null;

  public UploadedPresentation(String podId,
                              String meetingId,
                              String id,
                              String temporaryPresentationId,
                              String name,
                              String baseUrl,
                              Boolean current,
                              String authzToken,
                              Boolean uploadFailed,
                              ArrayList<String> uploadFailReason,
                              Boolean defaultPresentation) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.id = id;
    this.temporaryPresentationId = temporaryPresentationId;
    this.name = name;
    this.baseUrl = baseUrl;
    this.isDownloadable = false;
    this.current = current;
    this.authzToken = authzToken;
    this.uploadFailed = uploadFailed;
    this.uploadFailReason = uploadFailReason;
    this.defaultPresentation = defaultPresentation;
  }

  public UploadedPresentation(String podId,
                              String meetingId,
                              String id,
                              String temporaryPresentationId,
                              String name,
                              String baseUrl,
                              Boolean current,
                              String authzToken,
                              Boolean uploadFailed,
                              ArrayList<String> uploadFailReason) {
    this(podId, meetingId, id, temporaryPresentationId, name, baseUrl,
            current, authzToken, uploadFailed, uploadFailReason, false);
  }

  public UploadedPresentation(String podId,
                              String meetingId,
                              String id,
                              String name,
                              String baseUrl,
                              Boolean current,
                              String authzToken,
                              Boolean uploadFailed,
                              ArrayList<String> uploadFailReason) {
    this(podId, meetingId, id, "", name, baseUrl,
            current, authzToken, uploadFailed, uploadFailReason, false);
  }

  public UploadedPresentation(String podId,
                              String meetingId,
                              String id,
                              String name,
                              String baseUrl,
                              Boolean current,
                              String authzToken,
                              Boolean uploadFailed,
                              ArrayList<String> uploadFailReason,
                              Boolean defaultPresentation) {
    this(podId, meetingId, id, "", name, baseUrl,
            current, authzToken, uploadFailed, uploadFailReason, defaultPresentation);
  }

  public File getUploadedFile() {
    return uploadedFile;
  }

  public void setUploadedFile(File uploadedFile) {
    this.uploadedFile = uploadedFile;
  }

  public String getUploadedFileHash() {
    return uploadedFileHash;
  }

  public void setUploadedFileHash(String uploadedFileHash) {
    this.uploadedFileHash = uploadedFileHash;
  }

  public String getMeetingId() {
    return meetingId;
  }

  public String getPodId() {
    return podId;
  }

  public String getId() {
    return id;
  }

  public String getTemporaryPresentationId() {
    return temporaryPresentationId;
  }

  public String getName() {
    return name;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  public String getFileType() {
    return fileType;
  }

  public void setFileType(String fileType) {
    this.fileType = fileType;
  }

  public int getNumberOfPages() {
    return numberOfPages;
  }

  public void setNumberOfPages(int numberOfPages) {
    this.numberOfPages = numberOfPages;
  }

  public String getConversionStatus() {
    return conversionStatus;
  }

  public void setConversionStatus(String conversionStatus) {
    this.conversionStatus = conversionStatus;
  }

  public boolean isDownloadable() {
    return isDownloadable;
  }

  public void setDownloadable() {
    this.isDownloadable = true;
  }

  public boolean isRemovable() {
    return isRemovable;
  }

  public void setRemovable(boolean removable) {
    isRemovable = removable;
  }

  public boolean isCurrent() {
    return current;
  }

  public void setCurrent(Boolean value) {
    this.current = value;
  }

  public String getAuthzToken() {
    return authzToken;
  }

  public void startConversion() {
    conversionStarted = true;
  }

  public boolean isConversionStarted() {
    return conversionStarted;
  }

  public boolean isUploadFailed() {
    return uploadFailed;
  }

  public ArrayList<String> getUploadFailReason() {
    return uploadFailReason;
  }

  public boolean isDefaultPresentation() {
    return defaultPresentation;
  }

  public boolean isSystemUpload() {
    return systemUpload;
  }

  public void setSystemUpload(boolean systemUpload) {
    this.systemUpload = systemUpload;
  }

  public String getFilenameConverted() {
    if (filenameConverted != null) {
      return filenameConverted;
    } else {
      return "";
    }
  }

  public void generateFilenameConverted(String newExtension) {
    String nameWithoutExtension = FilenameUtils.removeExtension(name);
    this.filenameConverted = nameWithoutExtension.concat("." + newExtension);
  }

  public long getMaxPageConversionTime() {
    return maxPageConversionTime;
  }

  public void setMaxPageConversionTime(long maxPageConversionTime) {
    if (maxPageConversionTime <= 0) maxPageConversionTime = 30L;
    this.maxPageConversionTime = maxPageConversionTime;
  }

  /** Mints one new page id (UUID v4) per page. Throws if the ids were already registered. */
  public void mintPageIds(int numberOfPages) {
    List<String> ids = new ArrayList<>(numberOfPages);
    for (int i = 0; i < numberOfPages; i++) {
      ids.add(UUID.randomUUID().toString());
    }
    registerPageIds(ids);
  }

  /** Registers ids generated elsewhere (a conversion cache restore), in page order. Throws if already registered. */
  public void adoptPageIds(List<String> ids) {
    registerPageIds(new ArrayList<>(ids));
  }

  private synchronized void registerPageIds(List<String> ids) {
    if (pageIds != null) {
      throw new IllegalStateException("Page ids of presentation " + id + " were already registered");
    }
    pageIds = Collections.unmodifiableList(ids);
  }

  /** Id of page num (1-based). Throws if no id was registered for it. */
  public String pageId(int num) {
    List<String> ids = pageIds;
    if (ids == null || num < 1 || num > ids.size()) {
      throw new IllegalStateException("No page id for page " + num + " of presentation " + id);
    }
    return ids.get(num - 1);
  }

  /** Page ids in page order; empty before they are registered. */
  public List<String> getPageIds() {
    List<String> ids = pageIds;
    return ids == null ? Collections.emptyList() : ids;
  }

  public long getMaxTotalConversionTime() {
    if (numberOfPages == 0) {
      return maxPageConversionTime;
    }
    return maxPageConversionTime * numberOfPages;
  }
}
