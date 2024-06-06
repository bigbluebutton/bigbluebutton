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
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import com.zaxxer.nuprocess.NuProcess;
import com.zaxxer.nuprocess.NuProcessBuilder;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.handlers.Office2PdfConverterHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

import static org.bigbluebutton.presentation.Util.deleteDirectoryFromFileHandlingErrors;

public abstract class Office2PdfPageConverter {
  private static Logger log = LoggerFactory.getLogger(Office2PdfPageConverter.class);

  public static boolean convert(File presentationFile, File output, int page, UploadedPresentation pres,
                         String presOfficeConversionExec, int conversionTimeout) {

    try {
      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("logCode", "office_doc_to_pdf");
      logData.put("message", "Converting Office doc to PDF.");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.info(" --analytics-- data={}", logStr);

      if(presOfficeConversionExec == null) throw new Exception("Cannot find the conversion script path.");

      File conversionScript = new File(presOfficeConversionExec);
      if(!conversionScript.exists()) throw new Exception(String.format("File not found: %s.",presOfficeConversionExec));

      log.info(String.format("Calling conversion script %s.", presOfficeConversionExec));

      NuProcessBuilder officeConverterExec = new NuProcessBuilder(Arrays.asList("timeout", conversionTimeout + "s", "/bin/sh", "-c",
              "\""+presOfficeConversionExec + "\" \"" + presentationFile.getAbsolutePath() + "\" \"" + output.getAbsolutePath()+"\" pdf " + conversionTimeout));
      Office2PdfConverterHandler office2PdfConverterHandler  = new Office2PdfConverterHandler();
      officeConverterExec.setProcessListener(office2PdfConverterHandler);

      NuProcess process = officeConverterExec.start();
      try {
        process.waitFor(conversionTimeout + 1, TimeUnit.SECONDS);
      } catch (InterruptedException e) {
        log.error("InterruptedException while counting PDF pages {}", presentationFile.getName(), e);
      }

      if(office2PdfConverterHandler.isCommandTimeout()) {
        log.error("Command execution ({}) exceeded the {} secs timeout for {}.",presOfficeConversionExec, conversionTimeout, presentationFile.getName());
      }

      if(!office2PdfConverterHandler.isCommandSuccessful()) {
        throw new Exception(String.format("Error while executing conversion script %s.", presOfficeConversionExec));
      }

      if (output.exists()) {
        return true;
      } else {
        logData = new HashMap<>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("logCode", "office_doc_to_pdf_failed");
        logData.put("message", "Failed to convert Office doc to PDF.");
        gson = new Gson();
        logStr = gson.toJson(logData);
        log.warn(" --analytics-- data={}", logStr);

        return false;
      }
    } catch (Exception e) {
      deleteDirectoryFromFileHandlingErrors(presentationFile);
      Map<String, Object> logData = new HashMap<>();
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("logCode", "office_doc_to_pdf_failed_with_exception");
      logData.put("message", "Failed to convert Office doc to PDF.");
      logData.put("exception", e);
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.error(" --analytics-- data={}", logStr, e);
      return false;
    }
  }



}
