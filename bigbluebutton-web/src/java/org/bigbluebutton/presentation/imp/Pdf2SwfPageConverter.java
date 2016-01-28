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
import com.zaxxer.nuprocess.NuAbstractProcessHandler;
import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;

public class Pdf2SwfPageConverter implements PageConverter {
  private static Logger log = LoggerFactory
      .getLogger(Pdf2SwfPageConverter.class);

  private String GHOSTSCRIPT_EXEC;
  private String IMAGEMAGICK_DIR;
  private String SWFTOOLS_DIR;
  private String fontsDir;
  private String noPdfMarkWorkaround;
  private long placementsThreshold;
  private long defineTextThreshold;
  private long imageTagThreshold;
  private String convTimeout = "5s";
  private int WAIT_FOR_SEC = 6;

  public boolean convert(File presentation, File output, int page, UploadedPresentation pres) {
    long convertStart = System.currentTimeMillis();

    String source = presentation.getAbsolutePath();
    String dest = output.getAbsolutePath();
    String AVM2SWF = "-T9";

    // Building the command line wrapped in shell to be able to use shell
    // feature like the pipe
    NuProcessBuilder pb = new NuProcessBuilder(
        Arrays.asList("timeout", convTimeout,
            "/bin/sh",
            "-c",
            SWFTOOLS_DIR
            + File.separator
            + "pdf2swf"
            + " -vv "
            + AVM2SWF
            + " -F "
            + fontsDir
            + " -p "
            + String.valueOf(page)
            + " "
            + source
            + " -o "
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
    log.debug("Pdf2Swf conversion duration: {} sec", (pdf2SwfEnd - pdf2SwfStart)/1000);

    File destFile = new File(dest);
    if (pHandler.isConversionSuccessfull() && destFile.exists()
        && pHandler.numberOfPlacements() < placementsThreshold
        && pHandler.numberOfTextTags() < defineTextThreshold
        && pHandler.numberOfImageTags() < imageTagThreshold) {
      return true;
    } else {
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);
      logData.put("convertSuccess", pHandler.isConversionSuccessfull());
      logData.put("fileExists", destFile.exists());
      logData.put("numObjectTags", pHandler.numberOfPlacements());
      logData.put("numTextTags", pHandler.numberOfTextTags());
      logData.put("numImageTags", pHandler.numberOfImageTags());
      Gson gson = new Gson();
      String logStr =  gson.toJson(logData);

      log.warn("Potential problem with generated SWF: data={}", logStr);

      File tempPdfPage = null;
      File tempPng = null;
      String basePresentationame = FilenameUtils.getBaseName(presentation.getName());
      try {
        tempPdfPage = File.createTempFile(basePresentationame + "-" + page, ".pdf");
        tempPng = File.createTempFile(basePresentationame + "-" + page, ".png");
      } catch (IOException ioException) {
        // We should never fall into this if the server is correctly configured
        log.error("Unable to create temporary files");
      }

      long gsStart = System.currentTimeMillis();

      // Step 1: Extract the PDF page into a single PDF file
      NuProcessBuilder pbPdf = new NuProcessBuilder(Arrays.asList("timeout", convTimeout,
          GHOSTSCRIPT_EXEC, "-sDEVICE=pdfwrite", "-dNOPAUSE", "-dQUIET",
          "-dBATCH", "-dFirstPage=" + page, "-dLastPage=" + page,
          "-sOutputFile=" + tempPdfPage.getAbsolutePath(), noPdfMarkWorkaround,
          presentation.getAbsolutePath()));

      NuAbstractProcessHandler pbPdfHandler = new NuAbstractProcessHandler() {};
      pbPdf.setProcessListener(pbPdfHandler);
      NuProcess processPdf = pbPdf.start();
      try {
        processPdf.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        log.error(e.getMessage());
      }

      long gsEnd = System.currentTimeMillis();
      log.debug("Ghostscript conversion duration: {} sec", (gsStart - gsEnd)/1000);

      long magickStart = System.currentTimeMillis();

      // Step 2: Convert a PDF page to PNG
      NuProcessBuilder pbPng = new NuProcessBuilder(Arrays.asList("timeout", convTimeout,
          IMAGEMAGICK_DIR + File.separator + "convert", "-density", "150",
          "-quality", "90", "-flatten", "+dither", "-depth", "8",
          tempPdfPage.getAbsolutePath(), tempPng.getAbsolutePath()));
      Pdf2PngPageConverterHandler pbPngHandler = new Pdf2PngPageConverterHandler();
      pbPng.setProcessListener(pbPngHandler);
      NuProcess processPng = pbPng.start();
      try {
        processPng.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        log.error(e.getMessage());
      }
      long magickEnd = System.currentTimeMillis();

      logData = new HashMap<String, Object>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);
      logData.put("conversionTime(sec)", (magickEnd - magickStart)/1000);

      logStr =  gson.toJson(logData);

      log.debug("ImageMagick conversion duration: {} sec", (magickEnd - magickStart)/1000);

      long png2swfStart = System.currentTimeMillis();

      // Step 3: Convert a PNG image to SWF
      source = tempPng.getAbsolutePath();
      NuProcessBuilder pbSwf = new NuProcessBuilder(Arrays.asList("timeout", convTimeout, SWFTOOLS_DIR
          + File.separator + "png2swf", "-o", dest, source));
      Png2SwfPageConverterHandler pSwfHandler = new Png2SwfPageConverterHandler();
      pbSwf.setProcessListener(pSwfHandler);
      NuProcess processSwf = pbSwf.start();
      try {
        processSwf.waitFor(WAIT_FOR_SEC, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        log.error(e.getMessage());
      }

      long png2swfEnd = System.currentTimeMillis();
      log.debug("ImageMagick conversion duration: {} sec", (png2swfEnd - png2swfStart)/1000);

      // Delete the temporary PNG and PDF files after finishing the image
      // conversion
      tempPdfPage.delete();
      tempPng.delete();

      boolean doneSwf = pSwfHandler.isConversionSuccessfull();

      long convertEnd = System.currentTimeMillis();

      logData = new HashMap<String, Object>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", page);
      logData.put("conversionTime(sec)", (convertEnd - convertStart)/1000);

      logStr =  gson.toJson(logData);

      log.debug("Problem page conversion duration: {} sec", (convertEnd - convertStart)/1000);


      if (doneSwf && destFile.exists()) {
        return true;
      } else {
        log.warn("Failed to convert: " + destFile + " does not exist.");
        return false;
      }
    }
  }

  public void setSwfToolsDir(String dir) {
    SWFTOOLS_DIR = dir;
  }

  public void setImageMagickDir(String dir) {
    IMAGEMAGICK_DIR = dir;
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

  public void setGhostscriptExec(String exec) {
    GHOSTSCRIPT_EXEC = exec;
  }

  public void setNoPdfMarkWorkaround(String noPdfMarkWorkaround) {
    this.noPdfMarkWorkaround = noPdfMarkWorkaround;
  }

}
