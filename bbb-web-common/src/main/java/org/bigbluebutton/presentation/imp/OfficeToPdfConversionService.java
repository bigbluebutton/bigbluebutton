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
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OfficeToPdfConversionService {
  private static Logger log = LoggerFactory.getLogger(OfficeToPdfConversionService.class);	

  /*
   * Convert the Office document to PDF. If successful, update 
   * UploadPresentation.uploadedFile with the new PDF out and
   * UploadPresentation.lastStepSuccessful to TRUE.
   */
  public UploadedPresentation convertOfficeToPdf(UploadedPresentation pres) {
    initialize(pres);
    if (SupportedFileTypes.isOfficeFile(pres.getFileType())) {
      File pdfOutput = setupOutputPdfFile(pres);				
      if (convertOfficeDocToPdf(pres, pdfOutput)) {
        log.info("Successfully converted office file to pdf.");
        makePdfTheUploadedFileAndSetStepAsSuccess(pres, pdfOutput);
      } else {
        log.warn("Failed to convert " + pres.getUploadedFile().getAbsolutePath() + " to Pdf.");
      }
    }
    return pres;
  }

  public void initialize(UploadedPresentation pres) {
    pres.setLastStepSuccessful(false);
  }

  private File setupOutputPdfFile(UploadedPresentation pres) {		
    File presentationFile = pres.getUploadedFile();
    String filenameWithoutExt = presentationFile.getAbsolutePath().substring(0, presentationFile.getAbsolutePath().lastIndexOf("."));
    return new File(filenameWithoutExt + ".pdf");
  }

  private boolean convertOfficeDocToPdf(UploadedPresentation pres, File pdfOutput) {
    PageConverter converter = new Office2PdfPageConverter();
    return converter.convert(pres.getUploadedFile(), pdfOutput, 0, pres);
  }

  private void makePdfTheUploadedFileAndSetStepAsSuccess(UploadedPresentation pres, File pdf) {
    pres.setUploadedFile(pdf);
    pres.setLastStepSuccessful(true);
  }
}
