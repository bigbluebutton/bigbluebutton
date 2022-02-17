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

import com.google.gson.Gson;
import org.bigbluebutton.presentation.ConversionMessageConstants;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Semaphore;

public class OfficeToPdfConversionService {
  private static Logger log = LoggerFactory.getLogger(OfficeToPdfConversionService.class);
  private OfficeDocumentValidator2 officeDocumentValidator;
  private boolean skipOfficePrecheck = false;
  private String presOfficeConversionExec = null;
  private Semaphore presOfficeConversionSemaphore = new Semaphore(4);
  private int presOfficeConversionTimeout = 60;

  /*
   * Convert the Office document to PDF. If successful, update
   * UploadPresentation.uploadedFile with the new PDF out and
   * UploadPresentation.lastStepSuccessful to TRUE.
   */
  public UploadedPresentation convertOfficeToPdf(UploadedPresentation pres) {
    initialize(pres);
    if (SupportedFileTypes.isOfficeFile(pres.getFileType())) {
      // Check if we need to precheck office document
      if (!skipOfficePrecheck && officeDocumentValidator.isValid(pres)) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("logCode", "problems_office_to_pdf_validation");
        logData.put("message", "Problems detected prior to converting the file to PDF.");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn(" --analytics-- data={}", logStr);
        pres.setConversionStatus(ConversionMessageConstants.OFFICE_DOC_CONVERSION_INVALID_KEY);
        return pres;
      }
      File pdfOutput = setupOutputPdfFile(pres);
      if (convertOfficeDocToPdf(pres, pdfOutput)) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("logCode", "office_to_pdf_success");
        logData.put("message", "Successfully converted office file to pdf.");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.info(" --analytics-- data={}", logStr);
        makePdfTheUploadedFileAndSetStepAsSuccess(pres, pdfOutput);
      } else {
        Map<String, Object> logData = new HashMap<>();
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("logCode", "office_to_pdf_failed");
        logData.put("message", "Failed to convert " + pres.getUploadedFile().getAbsolutePath() + " to Pdf.");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn(" --analytics-- data={}", logStr);
        pres.setConversionStatus(ConversionMessageConstants.OFFICE_DOC_CONVERSION_FAILED_KEY);
        return pres;
      }
    }
    return pres;
  }
  public void initialize(UploadedPresentation pres) {
    pres.setConversionStatus(ConversionMessageConstants.OFFICE_DOC_CONVERSION_FAILED_KEY);
  }
  private File setupOutputPdfFile(UploadedPresentation pres) {
    File presentationFile = pres.getUploadedFile();
    String filenameWithoutExt = presentationFile.getAbsolutePath().substring(0,
        presentationFile.getAbsolutePath().lastIndexOf('.'));
    return new File(filenameWithoutExt + ".pdf");
  }
  private boolean convertOfficeDocToPdf(UploadedPresentation pres, File pdfOutput) {
    boolean success = false;
    int attempts = 0;
    while(!success) {

      try {
        if(presOfficeConversionSemaphore.availablePermits() == 0) {
          log.info("Waiting for previous conversions finish before start (meetingId: {}, presId: {}, filename: {}), current queue: {}.",
                  pres.getMeetingId(), pres.getId(), pres.getName(), presOfficeConversionSemaphore.getQueueLength());
        }
        presOfficeConversionSemaphore.acquire();

        success = Office2PdfPageConverter.convert(pres.getUploadedFile(), pdfOutput, 0, pres,
                presOfficeConversionExec, presOfficeConversionTimeout);

      } catch (Exception e) {
      } finally {
        presOfficeConversionSemaphore.release();
      }

      
      if(!success) {
        if(++attempts != 3) {
          //Try again
        } else {
          break;
        }
      }
    }

    return success;
  }

  private void makePdfTheUploadedFileAndSetStepAsSuccess(UploadedPresentation pres, File pdf) {
    pres.setUploadedFile(pdf);
    pres.setConversionStatus(ConversionMessageConstants.OFFICE_DOC_CONVERSION_SUCCESS_KEY);
  }

  public void setOfficeDocumentValidator(OfficeDocumentValidator2 v) {
    officeDocumentValidator = v;
  }

  public void setSkipOfficePrecheck(boolean skipOfficePrecheck) {
    this.skipOfficePrecheck = skipOfficePrecheck;
  }

  public void setPresOfficeConversionExec(String presOfficeConversionExec) {
    this.presOfficeConversionExec = presOfficeConversionExec;
  }

  public void setPresOfficeConversionTimeout(int presOfficeConversionTimeout) {
    this.presOfficeConversionTimeout = presOfficeConversionTimeout;
  }

  public void setPresOfficeConversionMaxConcurrents(int presOfficeConversionMaxConcurrents) {
    presOfficeConversionSemaphore = new Semaphore(presOfficeConversionMaxConcurrents);
  }

}

