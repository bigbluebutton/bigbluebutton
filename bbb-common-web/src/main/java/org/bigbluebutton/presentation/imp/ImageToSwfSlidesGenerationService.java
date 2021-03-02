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

import java.text.DecimalFormat;
import java.util.concurrent.Callable;
import java.util.concurrent.CompletionService;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorCompletionService;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.bigbluebutton.presentation.FileTypeConstants;
import org.bigbluebutton.presentation.ImageResizer;
import org.bigbluebutton.presentation.ImageToSwfSlide;
import org.bigbluebutton.presentation.PageConverter;
import org.bigbluebutton.presentation.PngCreator;
import org.bigbluebutton.presentation.SvgImageCreator;
import org.bigbluebutton.presentation.TextFileCreator;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ImageToSwfSlidesGenerationService {
	private static Logger log = LoggerFactory.getLogger(ImageToSwfSlidesGenerationService.class);
	
	private ExecutorService executor;
	private CompletionService<ImageToSwfSlide> completionService;	
	private SwfSlidesGenerationProgressNotifier notifier;
	private PageConverter jpgToSwfConverter;
	private PageConverter pngToSwfConverter;
	private SvgImageCreator svgImageCreator;
	private ThumbnailCreator thumbnailCreator;
	private TextFileCreator textFileCreator;
	private PngCreator pngCreator;
	private ImageResizer imageResizer;
	private Long maxImageSize;
	private long MAX_CONVERSION_TIME = 5*60*1000L;
	private String BLANK_SLIDE;
	private boolean swfSlidesRequired;
	private boolean svgImagesRequired;
	private boolean generatePngs;
	
	public ImageToSwfSlidesGenerationService() {
		int numThreads = Runtime.getRuntime().availableProcessors();
		executor = Executors.newFixedThreadPool(numThreads);
		completionService = new ExecutorCompletionService<ImageToSwfSlide>(executor);
	}

	public void generateSlides(UploadedPresentation pres) {

		for (int page = 1; page <= pres.getNumberOfPages(); page++) {
			if (swfSlidesRequired) {
				if (pres.getNumberOfPages() > 0) {
					PageConverter pageConverter = determinePageConverter(pres);
					convertImageToSwf(pres, pageConverter);
				}
			}

			/* adding accessibility */
			createTextFiles(pres, page);
			createThumbnails(pres, page);

			if (svgImagesRequired) {
				createSvgImages(pres, page);
			}

			if (generatePngs) {
				createPngImages(pres, page);
			}

			notifier.sendConversionUpdateMessage(page, pres, page);
		}

		System.out.println("****** Conversion complete for " + pres.getName());
		notifier.sendConversionCompletedMessage(pres);

	}
	
	private PageConverter determinePageConverter(UploadedPresentation pres) {
		String fileType = pres.getFileType().toUpperCase();
		if ((FileTypeConstants.JPEG.equalsIgnoreCase(fileType)) || (FileTypeConstants.JPG.equalsIgnoreCase(fileType))) {
			return jpgToSwfConverter;
		}
		
		return pngToSwfConverter;
	}
	
	private void createTextFiles(UploadedPresentation pres, int page) {
		log.debug("Creating textfiles for accessibility.");
		notifier.sendCreatingTextFilesUpdateMessage(pres);
		textFileCreator.createTextFile(pres, page);
	}
	
	private void createThumbnails(UploadedPresentation pres, int page) {
		log.debug("Creating thumbnails.");
		notifier.sendCreatingThumbnailsUpdateMessage(pres);
		thumbnailCreator.createThumbnail(pres, page, pres.getUploadedFile());
	}
	
	private void createSvgImages(UploadedPresentation pres, int page) {
		log.debug("Creating SVG images.");
		notifier.sendCreatingSvgImagesUpdateMessage(pres);
		svgImageCreator.createSvgImage(pres, page);
	}
	
   private void createPngImages(UploadedPresentation pres, int page) {
        pngCreator.createPng(pres, page, pres.getUploadedFile());
   }

	private void convertImageToSwf(UploadedPresentation pres, PageConverter pageConverter) {
		int numPages = pres.getNumberOfPages();
		// A better implementation is described at the link below
		// https://stackoverflow.com/questions/4513648/how-to-estimate-the-size-of-jpeg-image-which-will-be-scaled-down
		if (pres.getUploadedFile().length() > maxImageSize) {
	        DecimalFormat percentFormat= new DecimalFormat("#.##%");
	        // Resize the image and overwrite it
            resizeImage(pres, percentFormat
                    .format(Double.valueOf(maxImageSize) / Double.valueOf(pres.getUploadedFile().length())));
		}
		ImageToSwfSlide[] slides = setupSlides(pres, numPages, pageConverter);
		generateSlides(slides);		
		handleSlideGenerationResult(pres, slides);		
	}
	
	private void resizeImage(UploadedPresentation pres, String ratio) {
	    imageResizer.resize(pres, ratio);
	}
	
	private void handleSlideGenerationResult(UploadedPresentation pres, ImageToSwfSlide[] slides) {
		long endTime = System.currentTimeMillis() + MAX_CONVERSION_TIME;

		for (int t = 0; t < slides.length; t++) {
			Future<ImageToSwfSlide> future = null;
			ImageToSwfSlide slide = null;
			try {
				long timeLeft = endTime - System.currentTimeMillis();
				future = completionService.take();
				slide = future.get(timeLeft, TimeUnit.MILLISECONDS);
			} catch (InterruptedException e) {
				log.error("InterruptedException while creating slide {}", pres.getName(), e);
			} catch (ExecutionException e) {
				log.error("ExecutionException while creating slide {}", pres.getName(), e);
			} catch (TimeoutException e) {
				log.error("TimeoutException while converting {}", pres.getName(), e);
			} finally {
				if ((slide != null) && (! slide.isDone())){
					log.warn("Creating blank slide for {}", slide.getPageNumber());
					future.cancel(true);
					slide.generateBlankSlide();
				}
			}
		}
	}
	
	private ImageToSwfSlide[] setupSlides(UploadedPresentation pres, int numPages, PageConverter pageConverter) {
		ImageToSwfSlide[] slides = new ImageToSwfSlide[numPages];
		
		for (int page = 1; page <= numPages; page++) {		
			ImageToSwfSlide slide = new ImageToSwfSlide(pres, page);
			slide.setBlankSlide(BLANK_SLIDE);
			slide.setPageConverter(pageConverter);
			
			// Array index is zero-based
			slides[page-1] = slide;
		}
		
		return slides;
	}
	
	private void generateSlides(ImageToSwfSlide[] slides) {
		for (int i = 0; i < slides.length; i++) {
			final ImageToSwfSlide slide = slides[i];
			completionService.submit(new Callable<ImageToSwfSlide>() {
				public ImageToSwfSlide call() {
					return slide.createSlide();
				}
			});
		}
	}

	public void setJpgPageConverter(PageConverter converter) {
		this.jpgToSwfConverter = converter;
	}
	
	public void setPngPageConverter(PageConverter converter) {
		this.pngToSwfConverter = converter;
	}
	
	public void setBlankSlide(String blankSlide) {
		this.BLANK_SLIDE = blankSlide;
	}
	
	public void setThumbnailCreator(ThumbnailCreator thumbnailCreator) {
		this.thumbnailCreator = thumbnailCreator;
	}

	public void setTextFileCreator(TextFileCreator textFileCreator) {
		this.textFileCreator = textFileCreator;
	}

	public void setPngCreator(PngCreator pngCreator) {
	  this.pngCreator = pngCreator;
	}
	
	public void setSvgImageCreator(SvgImageCreator svgImageCreator) {
		this.svgImageCreator = svgImageCreator;
	}
	
	public void setGeneratePngs(boolean generatePngs) {
	  this.generatePngs = generatePngs;
	}

	public void setSwfSlidesRequired(boolean swf) {
	  this.swfSlidesRequired = swf;
	}

	public void setSvgImagesRequired(boolean svg) {
	  this.svgImagesRequired = svg;
	}
	
	public void setMaxConversionTime(int minutes) {
		MAX_CONVERSION_TIME = minutes * 60 * 1000L;
	}
	
	public void setSwfSlidesGenerationProgressNotifier(SwfSlidesGenerationProgressNotifier notifier) {
		this.notifier = notifier;
	}
	
	public void setImageResizer(ImageResizer imageResizer) {
	    this.imageResizer = imageResizer;
	}
	
	public void setMaxImageSize(Long maxImageSize) {
	    this.maxImageSize = maxImageSize;
	}
}
