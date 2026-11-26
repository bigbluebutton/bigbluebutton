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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.TimeUnit;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import com.google.gson.Gson;

public class ThumbnailCreatorImp implements ThumbnailCreator {
  private static Logger log = LoggerFactory.getLogger(ThumbnailCreatorImp.class);

  private static final Pattern PAGE_NUMBER_PATTERN = Pattern.compile("(temp-thumb)-([0-9]+)-([0-9]+)(\\.png)");

  private static String TEMP_THUMB_NAME = "temp-thumb";

  private String IMAGEMAGICK_DIR;

  private String BLANK_THUMBNAIL;

  private long execTimeout = 10;

  @Override
  public boolean createThumbnail(UploadedPresentation pres, int page, File pageFile, boolean useBlank) {
    boolean success = false;
    File thumbsDir = determineThumbnailDirectory(pres.getUploadedFile());

    if (!thumbsDir.exists())
      thumbsDir.mkdir();

    File thumb = PageArtifacts.Type.THUMBNAIL.file(pres.getUploadedFile().getParentFile(), pres.pageId(page));

    if (useBlank) {
        createBlankThumbnail(thumb, page);
        return true;
    }

    try {
      success = generateThumbnail(thumbsDir, thumb, pres, page, pageFile);
    } catch (InterruptedException e) {
      log.error("Interrupted Exception while generating thumbnails {}", pres.getName(), e);
      success = false;
    }

    renameThumbnail(thumbsDir, thumb, page);

    // Create blank thumbnails for pages that failed to generate a thumbnail.
    if (!success) {
      createBlankThumbnail(thumb, page);
    }


    return success;
  }

  private boolean generateThumbnail(File thumbsDir, File thumb, UploadedPresentation pres, int page, File pageFile)
      throws InterruptedException {
    String source = pageFile.getAbsolutePath();
    String dest = thumb.getAbsolutePath();
    String COMMAND = "";

    // Skip processing if the destination file exists, as it was likely restored from the cache
    if(Files.exists(Paths.get(dest))) {
      return true;
    }

    if (SupportedFileTypes.isImageFile(pres.getFileType())) {
      COMMAND = IMAGEMAGICK_DIR + File.separatorChar + "convert -thumbnail 150x150 "  + source + " " + dest;
    } else {
      String pdftoppmDest = thumbsDir.getAbsolutePath() + File.separatorChar + TEMP_THUMB_NAME + "-" + page; // the "-x.png" is appended automagically
      // pdftoppm rather than pdftocairo, which drops the content behind some soft masks (issue #23953).
      // -cropbox renders the page's CropBox, as the slide SVG does, not the whole MediaBox (issue #26506).
      COMMAND = "pdftoppm -cropbox -png -scale-to 150 " + source + " " + pdftoppmDest;
    }

    //System.out.println(COMMAND);

    long execTimeout = this.execTimeout;
    long pageConversionTimeoutInMs = pres.getMaxPageConversionTime() * 1000;
    if (execTimeout > pageConversionTimeoutInMs) {
      execTimeout = pageConversionTimeoutInMs;
    }

    boolean done = new ExternalProcessExecutor().exec(COMMAND, TimeUnit.SECONDS.toMillis(execTimeout));

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

  @Override
  public void createBlank(UploadedPresentation pres, int page) {
    File dir = determineThumbnailDirectory(pres.getUploadedFile());

    if (!dir.exists()) {
      boolean created = dir.mkdir();
      if (!created) {
        log.warn("Failed to create thumbnail directory");
        return;
      }
    }

    createBlankThumbnail(PageArtifacts.Type.THUMBNAIL.file(pres.getUploadedFile().getParentFile(), pres.pageId(page)), page);
  }

  private File determineThumbnailDirectory(File presentationFile) {
    return new File(
        presentationFile.getParent() + File.separatorChar + "thumbnails");
  }

  // pdftoppm writes the thumbnail of page N as temp-thumb-N-<index>.png: give it the page's name.
  private void renameThumbnail(File dir, File thumb, int page) {
    File[] temps = dir.listFiles((d, name) -> {
      Matcher matcher = PAGE_NUMBER_PATTERN.matcher(name);
      return matcher.matches() && Integer.parseInt(matcher.group(2)) == page;
    });
    if (temps != null && temps.length > 0) {
      temps[0].renameTo(thumb);
    }
  }

  private void createBlankThumbnail(File thumb, int page) {
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

  public void setExecTimeout(long execTimeout) {
    this.execTimeout = execTimeout;
  }
}
