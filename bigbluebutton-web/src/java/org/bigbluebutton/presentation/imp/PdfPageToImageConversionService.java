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
import org.bigbluebutton.presentation.PageExtractor;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfPageToImageConversionService {
  private static Logger log = LoggerFactory.getLogger(PdfPageToImageConversionService.class);

  private PageExtractor extractor;
  private PageConverter pdfToImageConverter;
  private PageConverter imageToSwfConverter;

  public boolean convertPageAsAnImage(File presentationFile, File output, int page, UploadedPresentation pres) {
    File tempDir = new File(presentationFile.getParent() + File.separatorChar + "temp");
    tempDir.mkdir();

    File tempPdfFile = new File(tempDir.getAbsolutePath() + File.separator + "temp-" + page + ".pdf");

    if (extractor.extractPage(presentationFile, tempPdfFile, page)) {
      File tempPngFile = new File(tempDir.getAbsolutePath() + "/temp-" + page + ".svg");

      if (pdfToImageConverter.convert(tempPdfFile, tempPngFile, 1, pres)) {
        if (imageToSwfConverter.convert(tempPngFile, output, 1, pres)) {
          return true;
        }
      }
    }		

    return false;
  }

  public void setPageExtractor(PageExtractor extractor) {
    this.extractor = extractor;
  }

  public void setPdfToImageConverter(PageConverter imageConverter) {
    this.pdfToImageConverter = imageConverter;
  }

  public void setImageToSwfConverter(PageConverter swfConverter) {
    this.imageToSwfConverter = swfConverter;
  }
}
