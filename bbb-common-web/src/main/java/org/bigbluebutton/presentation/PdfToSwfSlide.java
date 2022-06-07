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
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class PdfToSwfSlide {
  private static Logger log = LoggerFactory.getLogger(PdfToSwfSlide.class);

  private UploadedPresentation pres;
  private int page;
  private PageConverter pdfToSwfConverter;
  private String BLANK_SLIDE;
  private int MAX_SWF_FILE_SIZE;

  private volatile boolean done = false;
  private File slide;
  private File pageFile;

  public PdfToSwfSlide(UploadedPresentation pres, int page, File pageFile) {
    this.pres = pres;
    this.page = page;
    this.pageFile = pageFile;
  }

  public PdfToSwfSlide createSlide() {
    slide = new File(pageFile.getParent() + File.separatorChar + "slide-" + page + ".swf");
    pdfToSwfConverter.convert(pageFile, slide, page, pres);

    // If all fails, generate a blank slide.
    if (!slide.exists()) {
      log.warn("Failed to create slide. Creating blank slide for " + slide.getAbsolutePath());
      generateBlankSlide();
    }

    done = true;

    return this;
  }

  public void generateBlankSlide() {
    if (BLANK_SLIDE != null) {
      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.warn("Creating blank slide: data={}", logStr);

      copyBlankSlide(slide);
    } else {
      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.warn("Failed to create blank slide: data={}", logStr);
    }
  }

  private void copyBlankSlide(File slide) {
    try {
      FileUtils.copyFile(new File(BLANK_SLIDE), slide);
    } catch (IOException e) {
      log.error("IOException while copying blank slide.", e);
    }
  }

  public void setPageConverter(PageConverter converter) {
    this.pdfToSwfConverter = converter;
  }

  public void setBlankSlide(String blankSlide) {
    this.BLANK_SLIDE = blankSlide;
  }

  public void setMaxSwfFileSize(int size) {
    this.MAX_SWF_FILE_SIZE = size;
  }

  public boolean isDone() {
    return done;
  }

  public int getPageNumber() {
    return page;
  }
}
