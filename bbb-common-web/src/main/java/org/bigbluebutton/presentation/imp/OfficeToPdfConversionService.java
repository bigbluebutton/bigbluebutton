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
import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.presentation.ConversionMessageConstants;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.jodconverter.core.office.OfficeException;
import org.jodconverter.core.office.OfficeManager;
import org.jodconverter.local.LocalConverter;
import org.jodconverter.local.office.LocalOfficeManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.sun.star.document.UpdateDocMode;
import com.google.gson.Gson;
public class OfficeToPdfConversionService {
  private static Logger log = LoggerFactory.getLogger(OfficeToPdfConversionService.class);
  private OfficeDocumentValidator2 officeDocumentValidator;
  private final OfficeManager officeManager;
  private final LocalConverter documentConverter;
  private boolean skipOfficePrecheck = false;
  public OfficeToPdfConversionService() throws OfficeException {
    final Map<String, Object> loadProperties = new HashMap<>();
    loadProperties.put("Hidden", true);
    loadProperties.put("ReadOnly", true);
    loadProperties.put("UpdateDocMode", UpdateDocMode.NO_UPDATE);
    officeManager = LocalOfficeManager
      .builder()
      .portNumbers(8100, 8101, 8102, 8103, 8104)
      .build();
    documentConverter = LocalConverter
      .builder()
      .officeManager(officeManager)
      .loadProperties(loadProperties)
      .filterChain(new OfficeDocumentConversionFilter())
      .build();
  }
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
  private boolean convertOfficeDocToPdf(UploadedPresentation pres,
      File pdfOutput) {
    Office2PdfPageConverter converter = new Office2PdfPageConverter();
    return converter.convert(pres.getUploadedFile(), pdfOutput, 0, pres, documentConverter);
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
  public void start() {
    try {
      officeManager.start();
    } catch (OfficeException e) {
      log.error("Could not start Office Manager", e);
    }
  }
  public void stop() {
    try {
      officeManager.stop();
    } catch (OfficeException e) {
      log.error("Could not stop Office Manager", e);
    }
  }
}
