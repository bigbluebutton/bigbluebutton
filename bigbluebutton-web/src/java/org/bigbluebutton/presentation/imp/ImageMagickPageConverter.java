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

package org.bigbluebutton.presentation.imp;

import java.io.File;

import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ImageMagickPageConverter implements PageConverter {
  private static Logger log = LoggerFactory.getLogger(ImageMagickPageConverter.class);

  private String IMAGEMAGICK_DIR;

  public boolean convert(File presentationFile, File output, int page, UploadedPresentation pres){

    String COMMAND = IMAGEMAGICK_DIR + "/convert -depth 8 " + presentationFile.getAbsolutePath() + " " + output.getAbsolutePath();          

    boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);            

    if (done && output.exists()) {
      return true;		
    } else {
      log.warn("Failed to convert: " + output.getAbsolutePath() + " does not exist.");
      return false;
    }

  }

  public void setImageMagickDir(String dir) {
    IMAGEMAGICK_DIR = dir;
  }
}


