/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2014 BigBlueButton Inc. and by respective authors (see below).
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
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class ThumbnailCreatorImp implements ThumbnailCreator {
  private static Logger log = LoggerFactory.getLogger(ThumbnailCreatorImp.class);

  private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("(.+-thumb)-([0-9]+)-([0-9]+)(.png)");

  private static String TEMP_THUMB_NAME = "temp-thumb";

  private String IMAGEMAGICK_DIR;

  private String BLANK_THUMBNAIL;

  @Override
  public boolean createThumbnail(UploadedPresentation pres, int page, File pageFile) {
    boolean success = false;
    File thumbsDir = determineThumbnailDirectory(pres.getUploadedFile());

    if (!thumbsDir.exists())
      thumbsDir.mkdir();

    try {
      success = generateThumbnail(thumbsDir, pres, page, pageFile);
    } catch (InterruptedException e) {
      log.error("Interrupted Exception while generating thumbnails {}", pres.getName(), e);
      success = false;
    }

    renameThumbnails(thumbsDir, page);

    // Create blank thumbnails for pages that failed to generate a thumbnail.
    if (!success) {
      createBlankThumbnail(thumbsDir, page);
    }


    return success;
  }

  private boolean generateThumbnail(File thumbsDir, UploadedPresentation pres, int page, File pageFile)
      throws InterruptedException {
    String source = pageFile.getAbsolutePath();
    String dest;
    String COMMAND = "";

    if (SupportedFileTypes.isImageFile(pres.getFileType())) {
      dest = thumbsDir.getAbsolutePath() + File.separatorChar + "thumb-" + page + ".png";
      COMMAND = IMAGEMAGICK_DIR + File.separatorChar + "convert -thumbnail 150x150 "  + source + " " + dest;
    } else {
      dest = thumbsDir.getAbsolutePath() + File.separatorChar + TEMP_THUMB_NAME + "-" + page; // the "-x.png" is appended automagically
      COMMAND = "pdftocairo -png -scale-to 150 " + source + " " + dest;
    }

    //System.out.println(COMMAND);

    boolean done = new ExternalProcessExecutor().exec(COMMAND, 10000);

    if (done) {
      return true;
    } else {
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);
      logData.put("logCode", "create_thumbnails_failed");
      logData.put("message", "Failed to create thumbnails.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.warn(" --analytics-- data={}", logStr);
    }

    return false;
  }

  private File determineThumbnailDirectory(File presentationFile) {
    return new File(
        presentationFile.getParent() + File.separatorChar + "thumbnails");
  }

  private void renameThumbnails(File dir, int page) {
    /*
     * If more than 1 file, filename like 'temp-thumb-X.png' else filename is
     * 'temp-thumb.png'
     */
    Matcher matcher;
    if (dir.list().length > 1) {
      File[] files = dir.listFiles();
      for (File file : files) {
        matcher = PAGE_NUMBER_PATTERN.matcher(file.getAbsolutePath());
        if (matcher.matches()) {
          // Path should be something like
          // 'c:/temp/bigluebutton/presname/thumbnails/temp-thumb-1.png'
          // Extract the page number. There should be 4 matches.
          // 0. c:/temp/bigluebutton/presname/thumbnails/temp-thumb-1.png
          // 1. c:/temp/bigluebutton/presname/thumbnails/temp-thumb
          // 2. 1 ---> what we are interested in
          // 3. .png
          // We are interested in the second match.
          int pageNum = Integer.valueOf(matcher.group(2).trim()).intValue();
          if (pageNum == page) {
            String newFilename = "thumb-" + (page) + ".png";
            File renamedFile = new File(
                    dir.getAbsolutePath() + File.separatorChar + newFilename);
            file.renameTo(renamedFile);
          }
        }
      }
    } else if (dir.list().length == 1) {
      File oldFilename = new File(
          dir.getAbsolutePath() + File.separatorChar + dir.list()[0]);
      String newFilename = "thumb-1.png";

      // Might be the first thumbnail of a set and it might be out of order
      // Avoid setting the second/third/... slide as thumb-1.png
      matcher = PAGE_NUMBER_PATTERN.matcher(oldFilename.getAbsolutePath());
      if (matcher.matches()) {
        int pageNum = Integer.valueOf(matcher.group(2).trim()).intValue();
        newFilename = "thumb-" + (pageNum) + ".png";
      }

      File renamedFile = new File(
          oldFilename.getParent() + File.separatorChar + newFilename);
      oldFilename.renameTo(renamedFile);
    }
  }

  private void createBlankThumbnail(File thumbsDir, int page) {
    File[] thumbs = thumbsDir.listFiles();

    File thumb = new File(thumbsDir.getAbsolutePath() + File.separatorChar + "thumb-" + page + ".png");
    if (!thumb.exists()) {
      log.info("Copying blank thumbnail for slide {}", page);
      copyBlankThumbnail(thumb);
    }
  }

  private void copyBlankThumbnail(File thumb) {
    try {
      FileUtils.copyFile(new File(BLANK_THUMBNAIL), thumb);
    } catch (IOException e) {
      log.error("IOException while copying blank thumbnail.", e);
    }
  }

  private void cleanDirectory(File directory) {
    File[] files = directory.listFiles();
    for (File file : files) {
      file.delete();
    }
  }

  public void setImageMagickDir(String imageMagickDir) {
    IMAGEMAGICK_DIR = imageMagickDir;
  }

  public void setBlankThumbnail(String blankThumbnail) {
    BLANK_THUMBNAIL = blankThumbnail;
  }

}
