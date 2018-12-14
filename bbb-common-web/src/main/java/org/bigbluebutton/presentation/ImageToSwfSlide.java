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

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ImageToSwfSlide {
  private static Logger log = LoggerFactory.getLogger(ImageToSwfSlide.class);

  private UploadedPresentation pres;
  private int page;

  private PageConverter imageToSwfConverter;
  private String BLANK_SLIDE;

  private boolean done = false;
  private File slide;

  public ImageToSwfSlide(UploadedPresentation pres, int page) {
    this.pres = pres;
    this.page = page;
  }

  public ImageToSwfSlide createSlide() {		
    File presentationFile = pres.getUploadedFile();
    slide = new File(presentationFile.getParent() + File.separatorChar + "slide-" + page + ".swf");
    log.debug("Creating slide {}", slide.getAbsolutePath());
    imageToSwfConverter.convert(presentationFile, slide, page, pres);

    // If all fails, generate a blank slide.
    if (!slide.exists()) {
      log.warn("Creating blank slide for {}", slide.getAbsolutePath());
      generateBlankSlide();
    }

    done = true;

    return this;
  }

  public void generateBlankSlide() {
    if (BLANK_SLIDE != null) {
      copyBlankSlide(slide);
    } else {
      log.error("Blank slide has not been set");
    }		
  }

  private void copyBlankSlide(File slide) {
    try {
      FileUtils.copyFile(new File(BLANK_SLIDE), slide);
    } catch (IOException e) {
      log.error("IOException while copying blank slide.");
    }
  }

  public void setPageConverter(PageConverter converter) {
    this.imageToSwfConverter = converter;
  }

  public void setBlankSlide(String blankSlide) {
    this.BLANK_SLIDE = blankSlide;
  }

  public boolean isDone() {
    return done;
  }

  public int getPageNumber() {
    return page;
  }
}
