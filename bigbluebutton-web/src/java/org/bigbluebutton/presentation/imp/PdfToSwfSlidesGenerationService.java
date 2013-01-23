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

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.FutureTask;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.bigbluebutton.presentation.ConversionMessageConstants;
import org.bigbluebutton.presentation.ConversionUpdateMessage;
import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.PdfToSwfSlide;
import org.bigbluebutton.presentation.TextFileCreator;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.ConversionUpdateMessage.MessageBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfToSwfSlidesGenerationService {
	private static Logger log = LoggerFactory.getLogger(PdfToSwfSlidesGenerationService.class);
		
	private SwfSlidesGenerationProgressNotifier notifier;
	private PageCounterService counterService;
	private PageConverter pdfToSwfConverter;
	private PdfPageToImageConversionService imageConvertService;
	private ThumbnailCreator thumbnailCreator;
	private TextFileCreator textFileCreator;
	private long MAX_CONVERSION_TIME = 5*60*1000;
	private String BLANK_SLIDE;
	private int MAX_SWF_FILE_SIZE;
		
	public void generateSlides(UploadedPresentation pres) {
		log.debug("Generating slides");		
		determineNumberOfPages(pres);
		log.debug("Determined number of pages " + pres.getNumberOfPages());
		if (pres.getNumberOfPages() > 0) {
			convertPdfToSwf(pres);
			/* adding accessibility */
			createTextFiles(pres);
			createThumbnails(pres);
			notifier.sendConversionCompletedMessage(pres);
		}		
	}
	
	private boolean determineNumberOfPages(UploadedPresentation pres) {
		try {
			counterService.determineNumberOfPages(pres);
			return true;
		} catch (CountingPageException e) {
			sendFailedToCountPageMessage(e, pres);
		}
		return false;
	}
	
	private void sendFailedToCountPageMessage(CountingPageException e, UploadedPresentation pres) {
		MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);
		
		if (e.getExceptionType() == CountingPageException.ExceptionType.PAGE_COUNT_EXCEPTION) {
			builder.messageKey(ConversionMessageConstants.PAGE_COUNT_FAILED_KEY);			
		} else if (e.getExceptionType() == CountingPageException.ExceptionType.PAGE_EXCEEDED_EXCEPTION) {
			builder.numberOfPages(pres.getNumberOfPages());
			builder.maxNumberPages(e.getMaxNumberOfPages());
			builder.messageKey(ConversionMessageConstants.PAGE_COUNT_EXCEEDED_KEY);
		}
		notifier.sendConversionUpdateMessage(builder.build().getMessage());
	}
	
	private void createThumbnails(UploadedPresentation pres) {
		log.debug("Creating thumbnails.");
		notifier.sendCreatingThumbnailsUpdateMessage(pres);
		thumbnailCreator.createThumbnails(pres);
	}
	
	private void createTextFiles(UploadedPresentation pres) {
		log.debug("Creating textfiles for accessibility.");
		notifier.sendCreatingTextFilesUpdateMessage(pres);
		textFileCreator.createTextFiles(pres);
	}
	
	private void convertPdfToSwf(UploadedPresentation pres) {
		int numPages = pres.getNumberOfPages();				
		List<PdfToSwfSlide> slides = setupSlides(pres, numPages);
		
		ExecutorService executor;
		CompletionService<PdfToSwfSlide> completionService;
		int numThreads = Runtime.getRuntime().availableProcessors();
		executor = Executors.newFixedThreadPool(numThreads);
		completionService = new ExecutorCompletionService<PdfToSwfSlide>(executor);			
		generateSlides(pres, slides, completionService);		
	}
	
	private void generateSlides(UploadedPresentation pres, List<PdfToSwfSlide> slides, CompletionService<PdfToSwfSlide> completionService) {
		long MAXWAIT = MAX_CONVERSION_TIME * 60 /*seconds*/ * 1000 /*millis*/;

		List<FutureTask<PdfToSwfSlide>> tasks = new ArrayList<FutureTask<PdfToSwfSlide>>(slides.size());
		for (final PdfToSwfSlide slide : slides) {
			Callable<PdfToSwfSlide> c = new Callable<PdfToSwfSlide>() {
				public PdfToSwfSlide call() {
					return slide.createSlide();
				};
			};
			
			FutureTask<PdfToSwfSlide> task = new FutureTask<PdfToSwfSlide>(c);
			tasks.add(task);
			completionService.submit(c);
		}		
		
		int slidesCompleted = 0;
		
		for (final PdfToSwfSlide slide : slides) {
			Future<PdfToSwfSlide> future = null;
			try {
				future = completionService.poll(MAXWAIT, TimeUnit.MILLISECONDS);
				if (future != null) {
					PdfToSwfSlide s = future.get();
					slidesCompleted++;
					notifier.sendConversionUpdateMessage(slidesCompleted, pres);
				} else {
					log.info("Timedout waiting for page to finish conversion.");
				}
			} catch (InterruptedException e) {
				log.error("InterruptedException while creating slide " + pres.getName());
			} catch (ExecutionException e) {
				log.error("ExecutionException while creating slide " + pres.getName());
			} 
		}
				
		for (final PdfToSwfSlide slide : slides) {
			if (! slide.isDone()){
				log.warn("Creating blank slide for " + slide.getPageNumber());
				slide.generateBlankSlide();				
				notifier.sendConversionUpdateMessage(slidesCompleted++, pres);
			}	
		}
	}
	
	private List<PdfToSwfSlide> setupSlides(UploadedPresentation pres, int numPages) {
		List<PdfToSwfSlide> slides = new ArrayList<PdfToSwfSlide>(numPages);
		
		for (int page = 1; page <= numPages; page++) {		
			PdfToSwfSlide slide = new PdfToSwfSlide(pres, page);
			slide.setBlankSlide(BLANK_SLIDE);
			slide.setMaxSwfFileSize(MAX_SWF_FILE_SIZE);
			slide.setPageConverter(pdfToSwfConverter);
			slide.setPdfPageToImageConversionService(imageConvertService);
			
			slides.add(slide);
		}
		
		return slides;
	}
	

		
	public void setCounterService(PageCounterService counterService) {
		this.counterService = counterService;
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
	
	public void setMaxSwfFileSize(int size) {
		this.MAX_SWF_FILE_SIZE = size;
	}
	
	public void setThumbnailCreator(ThumbnailCreator thumbnailCreator) {
		this.thumbnailCreator = thumbnailCreator;
	}
	public void setTextFileCreator(TextFileCreator textFileCreator) {
		this.textFileCreator = textFileCreator;
	}
	
	public void setMaxConversionTime(int minutes) {
		MAX_CONVERSION_TIME = minutes * 60 * 1000;
	}
	
	public void setSwfSlidesGenerationProgressNotifier(SwfSlidesGenerationProgressNotifier notifier) {
		this.notifier = notifier;
	}
}
