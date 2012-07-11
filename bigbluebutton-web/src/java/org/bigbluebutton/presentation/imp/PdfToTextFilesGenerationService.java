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

import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfToTextFilesGenerationService {
	private static Logger log = LoggerFactory.getLogger(PdfToTextFilesGenerationService.class);

	public void generateFiles(UploadedPresentation pres) {
		log.debug("Generating text files");		
		/*determineNumberOfPages(pres);
		log.debug("Determined number of pages " + pres.getNumberOfPages());
		if (pres.getNumberOfPages() > 0) {
			convertPdfToSwf(pres);
			createThumbnails(pres);
			notifier.sendConversionCompletedMessage(pres);
		}*/		
	}
}
