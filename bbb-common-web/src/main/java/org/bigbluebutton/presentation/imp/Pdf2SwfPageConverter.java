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
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.handlers.Pdf2PngPageConverterHandler;
import org.bigbluebutton.presentation.handlers.Pdf2SwfPageConverterHandler;
import org.bigbluebutton.presentation.handlers.Png2SwfPageConverterHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;
import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class Pdf2SwfPageConverter implements PageConverter {
  private static Logger log = LoggerFactory
      .getLogger(Pdf2SwfPageConverter.class);

  private String SWFTOOLS_DIR;
  private String fontsDir;
  private long placementsThreshold;
  private long defineTextThreshold;
  private long imageTagThreshold;
  private String convTimeout = "7s";
  private int WAIT_FOR_SEC = 7;

  public boolean convert(File presentation, File output, int page,
      UploadedPresentation pres) {
    long convertStart = System.currentTimeMillis();

    String source = presentation.getAbsolutePath();
    String dest = output.getAbsolutePath();
    String AVM2SWF = "-T9";

    // Building the command line wrapped in shell to be able to use shell
    // feature like the pipe
    NuProcessBuilder pb = new NuProcessBuilder(Arrays.asList("timeout",
        convTimeout, "/bin/sh", "-c",
        SWFTOOLS_DIR + File.separatorChar + "pdf2swf" + " -vv " + AVM2SWF + " -F "
            + fontsDir + " -p " + Integer.toString(page) + " " + source + " -o "
            + dest
            + " | egrep  'shape id|Updating font|Drawing' | sed 's/  / /g' | cut -d' ' -f 1-3  | sort | uniq -cw 15"));

    Pdf2SwfPageConverterHandler pHandler = new Pdf2SwfPageConverterHandler();
    pb.setProcessListener(pHandler);

    long pdf2SwfStart = System.currentTimeMillis();

    NuProcess process = pb.start();
    try {
      process.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
    } catch (InterruptedException e) {
      log.error(e.getMessage());
    }

    long pdf2SwfEnd = System.currentTimeMillis();
    log.debug("Pdf2Swf conversion duration: {} sec",
        (pdf2SwfEnd - pdf2SwfStart) / 1000);

    boolean timedOut = pdf2SwfEnd
        - pdf2SwfStart >= Integer.parseInt(convTimeout.replaceFirst("s", ""))
            * 1000;
    boolean twiceTotalObjects = pHandler.numberOfPlacements()
        + pHandler.numberOfTextTags()
        + pHandler.numberOfImageTags() >= (placementsThreshold
            + defineTextThreshold + imageTagThreshold) * 2;

    File destFile = new File(dest);
    if (pHandler.isCommandSuccessful() && destFile.exists()
        && pHandler.numberOfPlacements() < placementsThreshold
        && pHandler.numberOfTextTags() < defineTextThreshold
        && pHandler.numberOfImageTags() < imageTagThreshold) {
      return true;
    } else {
      // We need t delete the destination file as we are starting a new
      // conversion process
      if (destFile.exists()) {
        destFile.delete();
      }

      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);
      logData.put("convertSuccess", pHandler.isCommandSuccessful());
      logData.put("fileExists", destFile.exists());
      logData.put("numObjectTags", pHandler.numberOfPlacements());
      logData.put("numTextTags", pHandler.numberOfTextTags());
      logData.put("numImageTags", pHandler.numberOfImageTags());
      logData.put("message", "Potential problem with generated SWF");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);

      log.warn("-- analytics -- {}", logStr);

      File tempPng = null;
      String basePresentationame = FilenameUtils.getBaseName(presentation.getName());
      try {
        tempPng = File.createTempFile(basePresentationame + "-" + page, ".png");
      } catch (IOException ioException) {
        // We should never fall into this if the server is correctly configured
        logData = new HashMap<>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("message", "Unable to create temporary files");
        gson = new Gson();
        logStr = gson.toJson(logData);
        log.error("-- analytics -- {}", logStr);
      }

      long pdfStart = System.currentTimeMillis();

      // Step 1: Convert a PDF page to PNG using a raw pdftocairo
      NuProcessBuilder pbPng = new NuProcessBuilder(
          Arrays.asList("timeout", convTimeout, "pdftocairo", "-png",
              "-singlefile", "-r", timedOut || twiceTotalObjects ? "72" : "150",
              "-f", String.valueOf(page), "-l", String.valueOf(page),
              presentation.getAbsolutePath(), tempPng.getAbsolutePath()
                  .substring(0, tempPng.getAbsolutePath().lastIndexOf('.'))));

      Pdf2PngPageConverterHandler pbPngHandler = new Pdf2PngPageConverterHandler();
      pbPng.setProcessListener(pbPngHandler);
      NuProcess processPng = pbPng.start();
      try {
        processPng.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        log.error(e.getMessage());
      }

      //long pdfEnd = System.currentTimeMillis();
      //log.debug("pdftocairo conversion duration: {} sec", (pdfEnd - pdfStart) / 1000);

      long png2swfStart = System.currentTimeMillis();

      // Step 2: Convert a PNG image to SWF
      // We need to update the file path as pdftocairo adds "-page.png"
      source = tempPng.getAbsolutePath();
      NuProcessBuilder pbSwf = new NuProcessBuilder(
          Arrays.asList("timeout", convTimeout,
              SWFTOOLS_DIR + File.separatorChar + "png2swf", "-o", dest, source));
      Png2SwfPageConverterHandler pSwfHandler = new Png2SwfPageConverterHandler();
      pbSwf.setProcessListener(pSwfHandler);
      NuProcess processSwf = pbSwf.start();
      try {
        processSwf.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        log.error(e.getMessage());
      }

      //long png2swfEnd = System.currentTimeMillis();
      //log.debug("SwfTools conversion duration: {} sec",          (png2swfEnd - png2swfStart) / 1000);

      // Delete the temporary PNG and PDF files after finishing the image
      // conversion
      tempPng.delete();

      boolean doneSwf = pSwfHandler.isCommandSuccessful();

      long convertEnd = System.currentTimeMillis();

      logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);
      logData.put("conversionTime(sec)", (convertEnd - convertStart) / 1000);
      logData.put("message", "Problem page conversion overall duration.");
      logStr = gson.toJson(logData);
      log.info("-- analytics -- {}", logStr);

      if (doneSwf && destFile.exists()) {
        return true;
      } else {
        logData = new HashMap<>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("page", page);
        logData.put("conversionTime(sec)", (convertEnd - convertStart) / 1000);
        logData.put("message", "Failed to convert: " + destFile + " does not exist.");
        logStr = gson.toJson(logData);
        log.warn("-- analytics -- {}", logStr);

        return false;
      }
    }
  }

  public void setSwfToolsDir(String dir) {
    SWFTOOLS_DIR = dir;
  }

  public void setFontsDir(String dir) {
    fontsDir = dir;
  }

  public void setPlacementsThreshold(long threshold) {
    placementsThreshold = threshold;
  }

  public void setDefineTextThreshold(long threshold) {
    defineTextThreshold = threshold;
  }

  public void setImageTagThreshold(long threshold) {
    imageTagThreshold = threshold;
  }
}
