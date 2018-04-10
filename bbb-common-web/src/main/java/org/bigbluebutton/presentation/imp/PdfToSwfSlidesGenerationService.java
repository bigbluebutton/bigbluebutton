/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * 
 * Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
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
import java.util.HashMap;
import java.util.List;
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

import org.bigbluebutton.presentation.*;
import org.bigbluebutton.presentation.ConversionUpdateMessage.MessageBuilder;
import org.bigbluebutton.presentation.messages.DocPageCountExceeded;
import org.bigbluebutton.presentation.messages.DocPageCountFailed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class PdfToSwfSlidesGenerationService {
  private static Logger log = LoggerFactory.getLogger(PdfToSwfSlidesGenerationService.class);

  private SwfSlidesGenerationProgressNotifier notifier;
  private PageCounterService counterService;
  private PageConverter pdfToSwfConverter;
  private ExecutorService executor;
  private ThumbnailCreator thumbnailCreator;
	private PngCreator pngCreator;

  private TextFileCreator textFileCreator;
  private SvgImageCreator svgImageCreator;
  private long MAX_CONVERSION_TIME = 5 * 60 * 1000;
  private String BLANK_SLIDE;
  private int MAX_SWF_FILE_SIZE;
  private boolean svgImagesRequired;
	private boolean generatePngs;

  private final long CONVERSION_TIMEOUT = 20000000000L; // 20s

  public PdfToSwfSlidesGenerationService(int numConversionThreads) {
    executor = Executors.newFixedThreadPool(numConversionThreads);
  }

  public void generateSlides(UploadedPresentation pres) {
    determineNumberOfPages(pres);
    if (pres.getNumberOfPages() > 0) {
      convertPdfToSwf(pres);
      createTextFiles(pres);
      createThumbnails(pres);

      // only create SVG images if the configuration requires it
      if (svgImagesRequired) {
        createSvgImages(pres);
      }

			// only create PNG images if the configuration requires it
			if (generatePngs) {
				createPngImages(pres);
			}

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

      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("podId", pres.getPodId());
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("message", "Failed to determine number of pages.");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.warn("-- analytics -- " + logStr);

      DocPageCountFailed progress = new DocPageCountFailed(pres.getPodId(), pres.getMeetingId(),
        pres.getId(), pres.getId(),
        pres.getName(), "notUsedYet", "notUsedYet",
        pres.isDownloadable(), ConversionMessageConstants.PAGE_COUNT_FAILED_KEY);

      notifier.sendDocConversionProgress(progress);

    } else if (e.getExceptionType() == CountingPageException.ExceptionType.PAGE_EXCEEDED_EXCEPTION) {
      builder.numberOfPages(e.getPageCount());
      builder.maxNumberPages(e.getMaxNumberOfPages());
      builder.messageKey(ConversionMessageConstants.PAGE_COUNT_EXCEEDED_KEY);

      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("podId", pres.getPodId());
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("pageCount", e.getPageCount());
      logData.put("maxNumPages", e.getMaxNumberOfPages());
      logData.put("message", "Number of pages exceeeded.");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.warn("-- analytics -- " + logStr);

      DocPageCountExceeded  progress = new DocPageCountExceeded(pres.getPodId(), pres.getMeetingId(),
        pres.getId(), pres.getId(),
        pres.getName(), "notUsedYet", "notUsedYet",
        pres.isDownloadable(), ConversionMessageConstants.PAGE_COUNT_EXCEEDED_KEY,
        e.getPageCount(), e.getMaxNumberOfPages());

      notifier.sendDocConversionProgress(progress);
    }

  }

  private void createThumbnails(UploadedPresentation pres) {
    notifier.sendCreatingThumbnailsUpdateMessage(pres);
    thumbnailCreator.createThumbnails(pres);
  }

  private void createTextFiles(UploadedPresentation pres) {
    notifier.sendCreatingTextFilesUpdateMessage(pres);
    textFileCreator.createTextFiles(pres);
  }

  private void createSvgImages(UploadedPresentation pres) {
    notifier.sendCreatingSvgImagesUpdateMessage(pres);
    svgImageCreator.createSvgImages(pres);
  }

	private void createPngImages(UploadedPresentation pres) {
		pngCreator.createPng(pres);
	}

  private void convertPdfToSwf(UploadedPresentation pres) {
    int numPages = pres.getNumberOfPages();
    List<PdfToSwfSlide> slides = setupSlides(pres, numPages);

    CompletionService<PdfToSwfSlide> completionService = new ExecutorCompletionService<PdfToSwfSlide>(
        executor);

    generateSlides(pres, slides, completionService);
  }

  private void generateSlides(UploadedPresentation pres,
      List<PdfToSwfSlide> slides,
      CompletionService<PdfToSwfSlide> completionService) {
    long MAXWAIT = MAX_CONVERSION_TIME * 60 /* seconds */ * 1000 /* millis */;
    int slidesCompleted = 0;

    long presConvStart = System.currentTimeMillis();

    for (final PdfToSwfSlide slide : slides) {
      long pageConvStart = System.currentTimeMillis();

      Callable<PdfToSwfSlide> c = new Callable<PdfToSwfSlide>() {
        public PdfToSwfSlide call() {
          return slide.createSlide();
        };
      };

      Future<PdfToSwfSlide> f = executor.submit(c);
      long endNanos = System.nanoTime() + CONVERSION_TIMEOUT;
      try {
        // Only wait for the remaining time budget
        long timeLeft = endNanos - System.nanoTime();
        PdfToSwfSlide s = f.get(timeLeft, TimeUnit.NANOSECONDS);
        slidesCompleted++;
        notifier.sendConversionUpdateMessage(slidesCompleted, pres);
      } catch (ExecutionException e) {
        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("podId", pres.getPodId());
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("page", slide.getPageNumber());
        logData.put("message", "ExecutionException while converting page.");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn("-- analytics -- " + logStr);

        log.error(e.getMessage());
      } catch (InterruptedException e) {
        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("podId", pres.getPodId());
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("page", slide.getPageNumber());
        logData.put("message", "InterruptedException while converting page");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn("-- analytics -- " + logStr);

        Thread.currentThread().interrupt();
      } catch (TimeoutException e) {
        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("podId", pres.getPodId());
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("page", slide.getPageNumber());
        logData.put("message", "TimeoutException while converting page");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn("-- analytics -- " + logStr);

        f.cancel(true);
      }

      long pageConvEnd = System.currentTimeMillis();
      Map<String, Object> logData = new HashMap<String, Object>();
      logData.put("podId", pres.getPodId());
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("page", slide.getPageNumber());
      logData.put("conversionTime(sec)", (pageConvEnd - pageConvStart) / 1000);
      logData.put("message", "Page conversion duration(sec)");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.info("-- analytics -- " + logStr);

    }

    for (final PdfToSwfSlide slide : slides) {
      if (!slide.isDone()) {

        slide.generateBlankSlide();

        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("podId", pres.getPodId());
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("page", slide.getPageNumber());
        logData.put("message", "Creating blank slide");
        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn("-- analytics -- " + logStr);

        notifier.sendConversionUpdateMessage(slidesCompleted++, pres);
      }
    }

    long presConvEnd = System.currentTimeMillis();
    Map<String, Object> logData = new HashMap<String, Object>();
    logData.put("podId", pres.getPodId());
    logData.put("meetingId", pres.getMeetingId());
    logData.put("presId", pres.getId());
    logData.put("filename", pres.getName());
    logData.put("conversionTime(sec)", (presConvEnd - presConvStart) / 1000);
    logData.put("message", "Presentation conversion duration (sec)");
    Gson gson = new Gson();
    String logStr = gson.toJson(logData);
    log.info("-- analytics -- " + logStr);

  }

  private List<PdfToSwfSlide> setupSlides(UploadedPresentation pres,
      int numPages) {
    List<PdfToSwfSlide> slides = new ArrayList<PdfToSwfSlide>(numPages);

    for (int page = 1; page <= numPages; page++) {
      PdfToSwfSlide slide = new PdfToSwfSlide(pres, page);
      slide.setBlankSlide(BLANK_SLIDE);
      slide.setMaxSwfFileSize(MAX_SWF_FILE_SIZE);
      slide.setPageConverter(pdfToSwfConverter);

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

  public void setBlankSlide(String blankSlide) {
    this.BLANK_SLIDE = blankSlide;
  }

  public void setMaxSwfFileSize(int size) {
    this.MAX_SWF_FILE_SIZE = size;
  }

  public void setGeneratePngs(boolean generatePngs) {
    this.generatePngs = generatePngs;
  }

	public void setSvgImagesRequired(boolean svg) {
		this.svgImagesRequired = svg;
	}

  public void setThumbnailCreator(ThumbnailCreator thumbnailCreator) {
    this.thumbnailCreator = thumbnailCreator;
  }

  public void setPngCreator(PngCreator pngCreator) {
    this.pngCreator = pngCreator;
  }

  public void setTextFileCreator(TextFileCreator textFileCreator) {
    this.textFileCreator = textFileCreator;
  }

  public void setSvgImageCreator(SvgImageCreator svgImageCreator) {
    this.svgImageCreator = svgImageCreator;
  }

  public void setMaxConversionTime(int minutes) {
    MAX_CONVERSION_TIME = minutes * 60 * 1000;
  }

  public void setSwfSlidesGenerationProgressNotifier(
      SwfSlidesGenerationProgressNotifier notifier) {
    this.notifier = notifier;
  }

}
