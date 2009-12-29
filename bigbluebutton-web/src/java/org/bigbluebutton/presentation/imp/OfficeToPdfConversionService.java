/* BigBlueButton - http://www.bigbluebutton.org
 * 
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * Author: Richard Alam <ritzalam@gmail.com>
 * 		   DJP <DJP@architectes.org>
 * 
 * @version $Id: $
 */
package org.bigbluebutton.presentation.imp;

import java.io.File;

import org.bigbluebutton.presentation.ChannelNameConstants;
import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OfficeToPdfConversionService {
	private static Logger log = LoggerFactory.getLogger(OfficeToPdfConversionService.class);	
	/*
	 * Converts the Office document to Pdf.
	 * Returns 
	 * 		the PDFChannel if successful
	 * 		the discardChannel if unsuccessful
	 */
	public String convertOfficeToPdf(UploadedPresentation pres) {
		if (SupportedFileTypes.isOfficeFile(pres.getFileType())) {
				PageConverter converter = new Office2PdfPageConverter();
				File presentationFile = pres.getUploadedFile();
				String filenameWithoutExt = presentationFile.getAbsolutePath().substring(0, presentationFile.getAbsolutePath().lastIndexOf("."));
				File pdfOutput = new File(filenameWithoutExt + ".pdf");
				boolean success = converter.convert(presentationFile, pdfOutput, 0);
				
				if (success) {
					log.info("Successfully converted office file to pdf.");
					return makePdfTheUploadedFileAndSendForProcessing(pres, pdfOutput);
				} 
		}
		return ChannelNameConstants.discardChannel;
	}
	
	private String makePdfTheUploadedFileAndSendForProcessing(UploadedPresentation pres, File pdf) {
		pres.setUploadedFile(pdf);
		return ChannelNameConstants.pdfFileChannel;
	}
}
