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

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.Writer;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.TextFileCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class TextFileCreatorImp implements TextFileCreator {
  private static Logger log = LoggerFactory.getLogger(TextFileCreatorImp.class);

  @Override
  public boolean createTextFile(UploadedPresentation pres, int page) {
    boolean success = false;
    File textfilesDir = determineTextfilesDirectory(pres.getUploadedFile());
    if (!textfilesDir.exists())
      textfilesDir.mkdir();


    try {
      success = generateTextFile(textfilesDir, pres, page);
    } catch (InterruptedException e) {
      log.error("Interrupted Exception while generating thumbnails {}", pres.getName(), e);
      success = false;
    }

    // TODO: in case that it doesn't generated the textfile, we should create a
    // textfile with some message
    // createUnavailableTextFile

    return success;
  }

  private boolean generateTextFile(File textfilesDir,
      UploadedPresentation pres, int page) throws InterruptedException {
    boolean success = true;
    String source = pres.getUploadedFile().getAbsolutePath();
    String dest;
    String COMMAND = "";

    if (SupportedFileTypes.isImageFile(pres.getFileType())) {
      dest = textfilesDir.getAbsolutePath() + File.separatorChar + "slide-1.txt";
      String text = "No text could be retrieved for the slide";

      File file = new File(dest);
      Writer writer = null;
      try {
        writer = new BufferedWriter(new FileWriter(file));
        writer.write(text);
      } catch (IOException e) {
        log.error("Error: ", e);
        success = false;
      } finally {
        try {
          writer.close();
        } catch (IOException e) {
          log.error("Error: ", e);
          success = false;
        }
      }

    } else {
      dest = textfilesDir.getAbsolutePath() + File.separatorChar + "slide-" + page + ".txt";
      // sudo apt-get install xpdf-utils

        COMMAND = "pdftotext -raw -nopgbrk -enc UTF-8 -f " + page + " -l " + page
            + " " + source + " " + dest;

        //System.out.println(COMMAND);

        boolean done = new ExternalProcessExecutor().exec(COMMAND, 60000);
        if (!done) {
          success = false;

          Map<String, Object> logData = new HashMap<String, Object>();
          logData.put("meetingId", pres.getMeetingId());
          logData.put("presId", pres.getId());
          logData.put("filename", pres.getName());
          logData.put("logCode", "create_txt_files_failed");
          logData.put("message", "Failed to create text files.");

          Gson gson = new Gson();
          String logStr = gson.toJson(logData);
          log.warn(" --analytics-- data={}", logStr);

        }
    }

    return success;
  }

  private File determineTextfilesDirectory(File presentationFile) {
    return new File(
        presentationFile.getParent() + File.separatorChar + "textfiles");
  }

  private void cleanDirectory(File directory) {
    File[] files = directory.listFiles();
    for (File file : files) {
      file.delete();
    }
  }

}
