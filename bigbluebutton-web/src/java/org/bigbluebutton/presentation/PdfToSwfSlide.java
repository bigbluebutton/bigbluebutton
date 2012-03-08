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
package org.bigbluebutton.presentation;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.bigbluebutton.presentation.imp.PdfPageToImageConversionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfToSwfSlide {
	private static Logger log = LoggerFactory.getLogger(PdfToSwfSlide.class);
	
	private UploadedPresentation pres;
	private int page;
	
	private PageConverter pdfToSwfConverter;
	private PdfPageToImageConversionService imageConvertService;
	private String BLANK_SLIDE;
	
	private volatile boolean done = false;
	private File slide;
	
	public PdfToSwfSlide(UploadedPresentation pres, int page) {
		this.pres = pres;
		this.page = page;
	}
	
	public PdfToSwfSlide createSlide() {		
		File presentationFile = pres.getUploadedFile();
		slide = new File(presentationFile.getParent() + File.separatorChar + "slide-" + page + ".swf");
		log.info("Creating slide " + slide.getAbsolutePath());
		if (! pdfToSwfConverter.convert(presentationFile, slide, page)) {
			log.info("Failed to convert slide. Let's take an image snapshot and convert to SWF");
			imageConvertService.convertPageAsAnImage(presentationFile, slide, page);
		} else {			
			if (slideMayHaveTooManyObjects(slide)) {
				log.info("Slide is too big. Let's take an image snapshot and convert to SWF");
				imageConvertService.convertPageAsAnImage(presentationFile, slide, page);
			}
		}

		// If all fails, generate a blank slide.
		if (!slide.exists()) {
			log.warn("Failed to create slide. Creating blank slide for " + slide.getAbsolutePath());
			generateBlankSlide();
		}
		
		done = true;
		
		return this;
	}
	
	private boolean slideMayHaveTooManyObjects(File slide) {
		// If the resulting swf file is greater than 500K, it probably contains a lot of objects
		// that it becomes very slow to render on the client. Take an image snapshot instead and
		// use it to generate the SWF file. (ralam Sept 2, 2009)
		return slide.length() > 500000;
	}
	
	public void generateBlankSlide() {
		if (BLANK_SLIDE != null) {
			copyBlankSlide(slide);
		} else {
			log.error("Blank slide has not been set");
		}		
	}
	
	private void copyBlankSlide(File slide) {
		try {
			FileUtils.copyFile(new File(BLANK_SLIDE), slide);
		} catch (IOException e) {
			log.error("IOException while copying blank slide.");
		}
	}
	
	public void setPageConverter(PageConverter converter) {
		this.pdfToSwfConverter = converter;
	}
	
	public void setPdfPageToImageConversionService(PdfPageToImageConversionService service) {
		this.imageConvertService = service;
	}
	
	public void setBlankSlide(String blankSlide) {
		this.BLANK_SLIDE = blankSlide;
	}

	public boolean isDone() {
		return done;
	}
	
	public int getPageNumber() {
		return page;
	}
}
