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
import java.util.ArrayList;
import java.util.List;
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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfToSwfSlidesGenerationService {
  private static Logger log = LoggerFactory.getLogger(PdfToSwfSlidesGenerationService.class);

  private SwfSlidesGenerationProgressNotifier notifier;
  private PageConverter pdfToSwfConverter;
  private ExecutorService executor;
  private ThumbnailCreator thumbnailCreator;
  private PngCreator pngCreator;

  private TextFileCreator textFileCreator;
  private SvgImageCreator svgImageCreator;
  private long bigPdfSize;
  private long maxBigPdfPageSize;
  private PageExtractor pageExtractor;
  private long MAX_CONVERSION_TIME = 5 * 60 * 1000L;
  private String BLANK_SLIDE;
  private int MAX_SWF_FILE_SIZE;
  private boolean swfSlidesRequired;
  private boolean svgImagesRequired;
  private boolean generatePngs;

  public PdfToSwfSlidesGenerationService(int numConversionThreads) {
    executor = Executors.newFixedThreadPool(5);
  }

  public void generateSlides(UploadedPresentation pres) {
    CompletionService<PageToConvert> completionService = new ExecutorCompletionService<PageToConvert>(executor);

    List<PageToConvert> pagesToConvert = new ArrayList<PageToConvert>();

    for (int page = 1; page <= pres.getNumberOfPages(); page++) {
      PageToConvert pageToConvert = new PageToConvert(
              pres,
              page,
              pageExtractor,
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
    long endNanos = System.currentTimeMillis() + MAX_CONVERSION_TIME;
    for (Future<PageToConvert> f : convertFutures) {
      try {
        // Only wait for the remaining time budget
        long timeLeft = endNanos - System.currentTimeMillis();
        PageToConvert s = f.get(timeLeft, TimeUnit.MILLISECONDS);
        pagesCompleted++;
        notifier.sendConversionUpdateMessage(pagesCompleted, pres, s.getPageNumber());
      } catch (ExecutionException e) {

      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
      } catch (TimeoutException e) {
        f.cancel(true);
      }
    }

    // Clean up temporary pdf files.
    for (final PageToConvert pageToConvert : pagesToConvert) {
      //pageToConvert.getPageFile().delete();
    }
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
