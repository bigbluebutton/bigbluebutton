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
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeoutException;

import org.bigbluebutton.presentation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ImageSlidesGenerationService {
	private static Logger log = LoggerFactory.getLogger(ImageSlidesGenerationService.class);

	private String blankThumbnail;
	private String blankPng;
	private String blankSvg;

	private ExecutorService executor;
	private SlidesGenerationProgressNotifier notifier;
	private ImageResizer imageResizer;
	private boolean generatePngs;
	private PresentationProcessExternal presentationProcessExternal;
	
	public ImageSlidesGenerationService() {
		int numThreads = Runtime.getRuntime().availableProcessors();
		executor = Executors.newFixedThreadPool(numThreads);
	}

	public void generateSlides(UploadedPresentation pres) {

		for (int page = 1; page <= pres.getNumberOfPages(); page++) {
			/* adding accessibility */

			File textfilesDir = Util.determineTextfilesDirectory(pres.getUploadedFile());
			if (!textfilesDir.exists())
				textfilesDir.mkdir();

			File thumbsDir = Util.determineThumbnailDirectory(pres.getUploadedFile());
			if (!thumbsDir.exists())
				thumbsDir.mkdir();

			File pngDir = Util.determinePngDirectory(pres.getUploadedFile());
			if (!pngDir.exists())
				pngDir.mkdir();

			File svgDir = Util.determineSvgImagesDirectory(pres.getUploadedFile());
			if (!svgDir.exists())
				svgDir.mkdir();

			// Call external application to process the image in a sandbox
			presentationProcessExternal.processImage(pres.getMeetingId(), pres.getId(), pres.getFileType());

			Util.createBlankThumbnail(thumbsDir, page, blankThumbnail);
			if (generatePngs) {
				Util.createBlankPng(pngDir, page, blankPng);
			}
			Util.createBlankSvg(svgDir, page, blankSvg);

			notifier.sendConversionUpdateMessage(page, pres, page);
		}

		System.out.println("****** Conversion complete for " + pres.getName());
		notifier.sendConversionCompletedMessage(pres);

	}

	private void resizeImage(UploadedPresentation pres, String ratio) {
	    imageResizer.resize(pres, ratio);
	}

	public void setGeneratePngs(boolean generatePngs) {
	  this.generatePngs = generatePngs;
	}

	public void setSlidesGenerationProgressNotifier(SlidesGenerationProgressNotifier notifier) {
		this.notifier = notifier;
	}
	
	public void setImageResizer(ImageResizer imageResizer) {
	    this.imageResizer = imageResizer;
	}

	public void setBlankThumbnail(String blankThumbnail) {
		this.blankThumbnail = blankThumbnail;
	}
	public void setBlankPng(String blankPng) {
		this.blankPng = blankPng;
	}
	public void setBlankSvg(String blankSvg) {
		this.blankSvg = blankSvg;
	}

	public void setPresentationProcessExternal(PresentationProcessExternal presentationProcessExternal) {
		this.presentationProcessExternal = presentationProcessExternal;
	}
}
