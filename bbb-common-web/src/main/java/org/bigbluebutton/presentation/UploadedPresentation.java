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

public final class UploadedPresentation {
  private final String podId;
  private final String meetingId;
  private final String id;
  private final String name;
  private final boolean uploadFailed;
  private final ArrayList<String> uploadFailReason;
  private File uploadedFile;
  private String fileType = "unknown";
  private int numberOfPages = 0;
  private String conversionStatus;
  private final String baseUrl;
  private boolean isDownloadable = false;
  private boolean current = false;
  private String authzToken;
  private boolean conversionStarted = false;


  public UploadedPresentation(String podId,
                              String meetingId,
                              String id,
                              String name,
                              String baseUrl,
                              Boolean current,
                              String authzToken,
                              Boolean uploadFailed,
                              ArrayList<String> uploadFailReason) {
    this.podId = podId;
    this.meetingId = meetingId;
    this.id = id;
    this.name = name;
    this.baseUrl = baseUrl;
    this.isDownloadable = false;
    this.current = current;
    this.authzToken = authzToken;
    this.uploadFailed = uploadFailed;
    this.uploadFailReason = uploadFailReason;
  }

  public File getUploadedFile() {
    return uploadedFile;
  }

  public void setUploadedFile(File uploadedFile) {
    this.uploadedFile = uploadedFile;
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
}
