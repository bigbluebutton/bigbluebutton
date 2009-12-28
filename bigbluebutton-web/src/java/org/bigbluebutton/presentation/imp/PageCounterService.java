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

import org.bigbluebutton.presentation.PageCounter;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PageCounterService {	
	private static Logger log = LoggerFactory.getLogger(PageCounterService.class);
	
	private int maxNumPages = 100;
	private PageCounter pageCounter;
	
	public void determineNumberOfPages(UploadedPresentation pres) {
		int numberOfPages = 0;
		if (SupportedFileTypes.isPdfFile(pres.getFileType())) {
			System.out.println("Counting pages for " + pres.getFileType());
			numberOfPages = countPages(pres);			
		} else if (SupportedFileTypes.isImageFile(pres.getFileType())) {
			System.out.println("Counting pages for " + pres.getFileType());
			numberOfPages = 1;
		}
		
		System.out.println("Counting pages for " + pres.getFileType() + " " + numberOfPages);
		pres.setNumberOfPages(numberOfPages);
	}
	
	private int countPages(UploadedPresentation pres) {
		int numPages = 0;
		System.out.println("Counting pages");
		if (pageCounter == null) {
			System.out.println("No page counter");
			return 0;
		}
		
		numPages = pageCounter.countNumberOfPages(pres.getUploadedFile());
		
		if (numPages > maxNumPages) {
			System.out.println("Number of pages greater than maximum [" + numPages + ">" + maxNumPages);
			log.warn("Number of pages greater than maximum [" + numPages + ">" + maxNumPages);
			return 0;
		}
		System.out.println("There are " + numPages);
		log.debug("There are " + numPages);
		return numPages;
	}
			
	public void setMaxNumPages(int maxPages) {
		maxNumPages = maxPages;
	}
		
	public void setPageCounter(PageCounter pageCounter) {
		this.pageCounter = pageCounter;
	}
}
