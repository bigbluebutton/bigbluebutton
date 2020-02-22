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

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
import org.bigbluebutton.presentation.messages.DocConversionStarted;
import org.bigbluebutton.presentation.messages.DocPageCountExceeded;
import org.bigbluebutton.presentation.messages.DocPageCountFailed;
import org.bigbluebutton.presentation.messages.PdfConversionInvalid;
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
  private long bigPdfSize;
  private long maxBigPdfPageSize;
  private PageExtractor pageExtractor;
  private long MAX_CONVERSION_TIME = 5 * 60 * 1000L * 1000L * 1000L;
  private String BLANK_SLIDE;
  private int MAX_SWF_FILE_SIZE;
  private boolean swfSlidesRequired;
  private boolean svgImagesRequired;
  private boolean generatePngs;
  private CompletionService<PageToConvert> completionService;

  public PdfToSwfSlidesGenerationService(int numConversionThreads) {
    executor = Executors.newFixedThreadPool(5);
    completionService = new ExecutorCompletionService<PageToConvert>(executor);
  }

  private void sendDocConversionStartedProgress(UploadedPresentation pres) {
    if (! pres.isConversionStarted()) {
      Map<String, Object> logData = new HashMap<String, Object>();

      logData.put("podId", pres.getPodId());
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("current", pres.isCurrent());
      logData.put("authzToken", pres.getAuthzToken());
      logData.put("logCode", "presentation_conversion_start");
      logData.put("message", "Start presentation conversion.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.info(" --analytics-- data={}", logStr);

      pres.startConversion();
      DocConversionStarted progress = new DocConversionStarted(
              pres.getPodId(),
              pres.getMeetingId(),
              pres.getId(),
              pres.getName(),
              pres.getAuthzToken(),
              pres.isDownloadable(),
              pres.isDownloadable(),
              pres.getNumberOfPages());
      notifier.sendDocConversionProgress(progress);
    }
  }

    public void generateSlides(UploadedPresentation pres) {
      determineNumberOfPages(pres);
      sendDocConversionStartedProgress(pres);

      List<PageToConvert> pagesToConvert = new ArrayList<PageToConvert>();

      for (int page = 1; page <= pres.getNumberOfPages(); page++) {
        File pageFile = extractPage(pres, page);
        PageToConvert pageToConvert = new PageToConvert(
          pres,
          page,
          pageFile,
          swfSlidesRequired,
          svgImagesRequired,
          generatePngs,
          textFileCreator,
          svgImageCreator,
          thumbnailCreator,
          pngCreator,
          pdfToSwfConverter,
          notifier,
          BLANK_SLIDE,
          MAX_SWF_FILE_SIZE
        );
        pagesToConvert.add(pageToConvert);
      }

      List<Future<PageToConvert>> convertFutures = new ArrayList<Future<PageToConvert>>(pres.getNumberOfPages());

      for (final PageToConvert pageToConvert : pagesToConvert) {
        Callable<PageToConvert> c = new Callable<PageToConvert>() {
          public PageToConvert call() {
            return pageToConvert.convert();
          }
        };

        Future<PageToConvert> f = executor.submit(c);
        convertFutures.add(f);
      }

      int pagesCompleted = 0;

      for (Future<PageToConvert> f : convertFutures) {
        long endNanos = System.nanoTime() + MAX_CONVERSION_TIME;
        try {
          // Only wait for the remaining time budget
          long timeLeft = endNanos - System.nanoTime();
          PageToConvert s = f.get(timeLeft, TimeUnit.NANOSECONDS);
          pagesCompleted++;
          notifier.sendConversionUpdateMessage(pagesCompleted, pres, s.getPageNumber());
        } catch (ExecutionException e) {

        } catch (InterruptedException e) {
          Thread.currentThread().interrupt();
        } catch (TimeoutException e) {
          f.cancel(true);
        }
      }

      notifier.sendConversionCompletedMessage(pres);

      // Clean up temporary pdf files.
      for (final PageToConvert pageToConvert : pagesToConvert) {
       // pageToConvert.getPageFile().delete();
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

  private File extractPage(UploadedPresentation pres, int page) {
    String presDir = pres.getUploadedFile().getParent();

    File tempPage = new File(presDir + "/page" + "-" + page + ".pdf");
    pageExtractor.extractPage(pres.getUploadedFile(), tempPage, page);

    return tempPage;
  }
  

  private void sendFailedToCountPageMessage(CountingPageException e, UploadedPresentation pres) {
    MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);

    if (e.getExceptionType() == CountingPageException.ExceptionType.PAGE_COUNT_EXCEPTION) {
      builder.messageKey(ConversionMessageConstants.PAGE_COUNT_FAILED_KEY);

      Map<String, Object> logData = new HashMap<>();
      logData.put("podId", pres.getPodId());
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("logCode", "determine_num_pages_failed");
      logData.put("message", "Failed to determine number of pages.");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.error(" --analytics-- data={}", logStr, e);

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
      logData.put("logCode", "num_pages_exceeded");
      logData.put("message", "Number of pages exceeded.");
      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.warn(" --analytics-- data={}", logStr);

      DocPageCountExceeded  progress = new DocPageCountExceeded(pres.getPodId(), pres.getMeetingId(),
        pres.getId(), pres.getId(),
        pres.getName(), "notUsedYet", "notUsedYet",
        pres.isDownloadable(), ConversionMessageConstants.PAGE_COUNT_EXCEEDED_KEY,
        e.getPageCount(), e.getMaxNumberOfPages());

      notifier.sendDocConversionProgress(progress);
    }

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

  public void setSwfSlidesRequired(boolean swfSlidesRequired) {
    this.swfSlidesRequired = swfSlidesRequired;
  }

  public void setBigPdfSize(long bigPdfSize) {
    this.bigPdfSize = bigPdfSize;
  }
  
  public void setMaxBigPdfPageSize(long maxBigPdfPageSize) {
    this.maxBigPdfPageSize = maxBigPdfPageSize;
  }
  
  public void setPageExtractor(PageExtractor extractor) {
    this.pageExtractor = extractor;
  }
  
  public void setSvgImagesRequired(boolean svgImagesRequired) {
    this.svgImagesRequired = svgImagesRequired;
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
    MAX_CONVERSION_TIME = minutes * 60 * 1000L * 1000L * 1000L;
  }

  public void setSwfSlidesGenerationProgressNotifier(
      SwfSlidesGenerationProgressNotifier notifier) {
    this.notifier = notifier;
  }

}
