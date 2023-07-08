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

import java.awt.image.BufferedImage;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeoutException;

import org.bigbluebutton.presentation.ImageResizer;
import org.bigbluebutton.presentation.PngCreator;
import org.bigbluebutton.presentation.SvgImageCreator;
import org.bigbluebutton.presentation.TextFileCreator;
import org.bigbluebutton.presentation.ThumbnailCreator;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.imageio.ImageIO;

public class ImageSlidesGenerationService {
	private static Logger log = LoggerFactory.getLogger(ImageSlidesGenerationService.class);
	
	private ExecutorService executor;
	private SlidesGenerationProgressNotifier notifier;
	private SvgImageCreator svgImageCreator;
	private ThumbnailCreator thumbnailCreator;
	private TextFileCreator textFileCreator;
	private PngCreator pngCreator;
	private ImageResizer imageResizer;
	private long maxImageWidth = 2048;
	private long maxImageHeight = 1536;
	private long MAX_CONVERSION_TIME = 5*60*1000L;
	private boolean svgImagesRequired=true;
	private boolean generatePngs;
	
	public ImageSlidesGenerationService() {
		int numThreads = Runtime.getRuntime().availableProcessors();
		executor = Executors.newFixedThreadPool(numThreads);
	}

	public void generateSlides(UploadedPresentation pres) {

		for (int page = 1; page <= pres.getNumberOfPages(); page++) {
			if (!pres.getIsExisted()) {
				/* adding accessibility */
				createTextFiles(pres, page);
				createThumbnails(pres, page);

				if (svgImagesRequired) {
					try {
						createSvgImages(pres, page);
					} catch (TimeoutException e) {
						log.error("Slide {} was not converted due to TimeoutException, ending process.", page, e);
						notifier.sendUploadFileTimedout(pres, page);
						break;
					}
				}

				if (generatePngs) {
					createPngImages(pres, page);
				}
			}

			notifier.sendConversionUpdateMessage(page, pres, page);
		}

		System.out.println("****** Conversion complete for " + pres.getName());
		notifier.sendConversionCompletedMessage(pres);

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
	
	private void createSvgImages(UploadedPresentation pres, int page) throws TimeoutException{
		if (pres.getIsExisted()) {
			notifier.sendCreatingSvgImagesUpdateMessage(pres);
			return;
		}

		log.debug("Creating SVG images.");

		try {
			BufferedImage bimg = ImageIO.read(pres.getUploadedFile());
			if(bimg.getWidth() > maxImageWidth || bimg.getHeight() > maxImageHeight) {
				log.info("The image exceeds max dimension allowed, it will be resized.");
				resizeImage(pres, maxImageWidth + "x" + maxImageHeight);
			}
		} catch (Exception e) {
			log.error("Exception while resizing image {}", pres.getName(), e);
		}

		notifier.sendCreatingSvgImagesUpdateMessage(pres);
		svgImageCreator.createSvgImage(pres, page);
	}
	
   private void createPngImages(UploadedPresentation pres, int page) {
        pngCreator.createPng(pres, page, pres.getUploadedFile());
   }

	private void resizeImage(UploadedPresentation pres, String ratio) {
	    imageResizer.resize(pres, ratio);
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

	public void setSvgImagesRequired(boolean svg) {
	  this.svgImagesRequired = svg;
	}
	
	public void setMaxConversionTime(int minutes) {
		MAX_CONVERSION_TIME = minutes * 60 * 1000L;
	}

	public void setSlidesGenerationProgressNotifier(SlidesGenerationProgressNotifier notifier) {
		this.notifier = notifier;
	}
	
	public void setImageResizer(ImageResizer imageResizer) {
	    this.imageResizer = imageResizer;
	}
	
	public void setMaxImageWidth(long maxImageWidth) {
	    this.maxImageWidth = maxImageWidth;
	}
	public void setMaxImageHeight(long maxImageHeight) {
		this.maxImageHeight = maxImageHeight;
	}
}
