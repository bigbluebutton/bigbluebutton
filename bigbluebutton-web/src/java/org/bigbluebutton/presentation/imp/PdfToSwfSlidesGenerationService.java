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

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.bigbluebutton.presentation.ConversionMessageConstants;
import org.bigbluebutton.presentation.ConversionUpdateMessage;
import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.PdfToSwfSlide;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.ConversionUpdateMessage.MessageBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfToSwfSlidesGenerationService {
	private static Logger log = LoggerFactory.getLogger(PdfToSwfSlidesGenerationService.class);
	
	private ExecutorService executor;
	private CompletionService<PdfToSwfSlide> completionService;
	
	private SwfSlidesGenerationProgressNotifier notifier;
	private PageCounterService counterService;
	private PageConverter pdfToSwfConverter;
	private PdfPageToImageConversionService imageConvertService;
	private ThumbnailCreator thumbnailCreator;
	private long MAX_CONVERSION_TIME = 5*60*1000;
	private String BLANK_SLIDE;
	
	public PdfToSwfSlidesGenerationService() {
		int numThreads = Runtime.getRuntime().availableProcessors();
		executor = Executors.newFixedThreadPool(numThreads);
		completionService = new ExecutorCompletionService<PdfToSwfSlide>(executor);
	}
	
	public void generateSlides(UploadedPresentation pres) {
		log.debug("Generating slides");		
		determineNumberOfPages(pres);
		log.debug("Determined number of pages " + pres.getNumberOfPages());
		if (pres.getNumberOfPages() > 0) {
			convertPdfToSwf(pres);
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
		thumbnailCreator.createThumbnails(pres.getUploadedFile(), pres.getNumberOfPages());
	}
	
	private void convertPdfToSwf(UploadedPresentation pres) {
		int numPages = pres.getNumberOfPages();				
		PdfToSwfSlide[] slides = setupSlides(pres, numPages);
		generateSlides(slides);		
		handleSlideGenerationResult(pres, slides);		
	}
	
	private void handleSlideGenerationResult(UploadedPresentation pres, PdfToSwfSlide[] slides) {
		long endTime = System.currentTimeMillis() + MAX_CONVERSION_TIME;
		int slideGenerated = 0;
		
		for (int t = 0; t < slides.length; t++) {
			Future<PdfToSwfSlide> future = null;
			PdfToSwfSlide slide = null;
			try {
				long timeLeft = endTime - System.currentTimeMillis();
				future = completionService.take();
				slide = future.get(timeLeft, TimeUnit.MILLISECONDS);
			} catch (InterruptedException e) {
				log.error("InterruptedException while creating slide " + pres.getName());
			} catch (ExecutionException e) {
				log.error("ExecutionException while creating slide " + pres.getName());
			} catch (TimeoutException e) {
				log.error("TimeoutException while converting " + pres.getName());				
			} finally {
				if ((slide != null) && (! slide.isDone())){
					log.warn("Creating blank slide for " + slide.getPageNumber());
					future.cancel(true);
					slide.generateBlankSlide();
				}
			}
			slideGenerated++;	
			notifier.sendConversionUpdateMessage(slideGenerated, pres);
		}
	}
	
	private PdfToSwfSlide[] setupSlides(UploadedPresentation pres, int numPages) {
		PdfToSwfSlide[] slides = new PdfToSwfSlide[numPages];
		
		for (int page = 1; page <= numPages; page++) {		
			PdfToSwfSlide slide = new PdfToSwfSlide(pres, page);
			slide.setBlankSlide(BLANK_SLIDE);
			slide.setPageConverter(pdfToSwfConverter);
			slide.setPdfPageToImageConversionService(imageConvertService);
			
			// Array index is zero-based
			slides[page-1] = slide;
		}
		
		return slides;
	}
	
	private void generateSlides(PdfToSwfSlide[] slides) {
		for (int i = 0; i < slides.length; i++) {
			System.out.println("generateSlides " + i);
			final PdfToSwfSlide slide = slides[i];
			completionService.submit(new Callable<PdfToSwfSlide>() {
				public PdfToSwfSlide call() {
					return slide.createSlide();
				}
			});
		}
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
	
	public void setThumbnailCreator(ThumbnailCreator thumbnailCreator) {
		this.thumbnailCreator = thumbnailCreator;
	}
	
	public void setMaxConversionTime(int minutes) {
		MAX_CONVERSION_TIME = minutes * 60 * 1000;
	}
	
	public void setSwfSlidesGenerationProgressNotifier(SwfSlidesGenerationProgressNotifier notifier) {
		this.notifier = notifier;
	}
}
