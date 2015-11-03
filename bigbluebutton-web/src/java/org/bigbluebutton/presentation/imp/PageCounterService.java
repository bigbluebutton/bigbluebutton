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

import org.bigbluebutton.presentation.PageCounter;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PageCounterService {	
	private static Logger log = LoggerFactory.getLogger(PageCounterService.class);
	
	private int maxNumPages = 100;
	private PageCounter pageCounter;
	
	public void determineNumberOfPages(UploadedPresentation pres) throws CountingPageException {
		int numberOfPages = 0;
		if (SupportedFileTypes.isPdfFile(pres.getFileType())) {
			numberOfPages = countPages(pres);			
		} else if (SupportedFileTypes.isImageFile(pres.getFileType())) {
			numberOfPages = 1;
		}
		
		if (isNumberOfPagesValid(numberOfPages)) {
			pres.setNumberOfPages(numberOfPages);
		}		
	}

	private boolean isNumberOfPagesValid(int numberOfPages) throws CountingPageException {
		if (numberOfPages <= 0) {
			throw new CountingPageException(CountingPageException.ExceptionType.PAGE_COUNT_EXCEPTION, 0, maxNumPages);
		} 
		
		if (checkIfNumberOfPagesExceedsLimit(numberOfPages)) {
			throw new CountingPageException(CountingPageException.ExceptionType.PAGE_EXCEEDED_EXCEPTION, numberOfPages, maxNumPages);
		}
		
		return true;
	}
	
	private boolean checkIfNumberOfPagesExceedsLimit(int numberOfPages) {
		if (numberOfPages > maxNumPages) {
			return true;
		}
		return false;
	}
	
	private int countPages(UploadedPresentation pres) {
		int numPages = 0;
		
		if (pageCounter == null) {
			log.warn("No page counter!");
			return 0;
		}
		
		numPages = pageCounter.countNumberOfPages(pres.getUploadedFile());
		return numPages;
	}
			
	public void setMaxNumPages(int maxPages) {
		maxNumPages = maxPages;
	}
		
	public void setPageCounter(PageCounter pageCounter) {
		this.pageCounter = pageCounter;
	}
}
