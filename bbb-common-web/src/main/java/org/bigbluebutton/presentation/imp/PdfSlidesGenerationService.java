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
import java.util.concurrent.*;
import org.bigbluebutton.presentation.messages.PageConvertProgressMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PdfSlidesGenerationService {
  private static Logger log = LoggerFactory.getLogger(PdfSlidesGenerationService.class);

  private ExecutorService executor;

  private BlockingQueue<PageToConvert> messages = new LinkedBlockingQueue<PageToConvert>();

  private PresentationConversionCompletionService presentationConversionCompletionService;

  public PdfSlidesGenerationService(int numConversionThreads) {
    executor = Executors.newFixedThreadPool(numConversionThreads);
  }

  public void process(PageToConvert pageToConvert) {
    executor.submit(() -> {
      try {
        log.info("Starting convert, page={}", pageToConvert.getPageNumber());
        pageToConvert.convert();
        log.info("Convert finished, sending progress message");

        PageConvertProgressMessage msg = new PageConvertProgressMessage(
                pageToConvert.getPageNumber(),
                pageToConvert.getPresId(),
                pageToConvert.getMeetingId(),
                new ArrayList<>());

        presentationConversionCompletionService.handle(msg);
        log.info("Progress message handled");
      } catch (Throwable t) {
        log.error("Conversion task failed", t);
      }
    });
  }

  public void setPresentationConversionCompletionService(PresentationConversionCompletionService s) {
    this.presentationConversionCompletionService = s;
  }
}
