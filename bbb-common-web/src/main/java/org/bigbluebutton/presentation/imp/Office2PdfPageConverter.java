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

import java.io.*;
import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public abstract class Office2PdfPageConverter {
  private static Logger log = LoggerFactory.getLogger(Office2PdfPageConverter.class);

//  public static boolean convert(File presentationFile, File output, int page, UploadedPresentation pres,
//                         LocalConverter converter){
  public static boolean convert(File presentationFile, File output, int page, UploadedPresentation pres,
                         String presOfficeConversionExec){

//    FileInputStream inputStream = null;
//    FileOutputStream outputStream = null;

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

//      This method using Jod as office converter was replaced by a customizable script (solving issue https://github.com/bigbluebutton/bigbluebutton/issues/10699)
//      final DocumentFormat sourceFormat = DefaultDocumentFormatRegistry.getFormatByExtension(
//              FilenameUtils.getExtension(presentationFile.getName()));
//
//      inputStream = new FileInputStream(presentationFile);
//      outputStream = new FileOutputStream(output);
//
//      converter.convert(inputStream).as(sourceFormat).to(outputStream).as(DefaultDocumentFormatRegistry.PDF).execute();
//      outputStream.flush();

      try {
        log.info("Calling conversion script " + presOfficeConversionExec);

        if(presOfficeConversionExec == null) throw new Exception("Cannot find the conversion script path.");

        File conversionScript = new File(presOfficeConversionExec);
        if(!conversionScript.exists()) throw new Exception(presOfficeConversionExec + ", file not found.");

        Process p = Runtime.getRuntime().exec(String.format(presOfficeConversionExec + " %s %s", presentationFile.getAbsolutePath(), output.getAbsolutePath()));

        BufferedReader stdInput = new BufferedReader(new InputStreamReader(p.getInputStream()));
        BufferedReader stdError = new BufferedReader(new InputStreamReader(p.getErrorStream()));
        String s = null;

        // read the output from the command
        while ((s = stdInput.readLine()) != null) {
          log.info(s);
        }

        // read any errors from the attempted command
        while ((s = stdError.readLine()) != null) {
          log.error(s);
        }

      } catch (IOException e) {
        log.error("Exception while calling convert script: " + e.getMessage(), presentationFile.getName());
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
    } finally {
//       if(inputStream!=null) {
//         try {
//           inputStream.close();
//         } catch(Exception e) {
//
//         }
//       }

//      if(outputStream!=null) {
//        try {
//          outputStream.close();
//        } catch(Exception e) {
//
//        }
//      }
    }
  }

}
