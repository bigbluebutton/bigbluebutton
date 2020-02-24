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

package org.bigbluebutton.presentation;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.presentation.imp.*;
import org.bigbluebutton.presentation.messages.DocPageConversionStarted;
import org.bigbluebutton.presentation.messages.DocConversionRequestReceived;
import org.bigbluebutton.presentation.messages.DocPageCountExceeded;
import org.bigbluebutton.presentation.messages.DocPageCountFailed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class DocumentConversionServiceImp implements DocumentConversionService {
  private static Logger log = LoggerFactory.getLogger(DocumentConversionServiceImp.class);

  private IBbbWebApiGWApp gw;
  private OfficeToPdfConversionService officeToPdfConversionService;
  private PdfToSwfSlidesGenerationService pdfToSwfSlidesGenerationService;
  private ImageToSwfSlidesGenerationService imageToSwfSlidesGenerationService;
  private SwfSlidesGenerationProgressNotifier notifier;
  private PageCounterService counterService;

  public void processDocument(UploadedPresentation pres) {
    SupportedDocumentFilter sdf = new SupportedDocumentFilter(gw);

    sendDocConversionStartedProgress(pres);

    if (sdf.isSupported(pres)) {
      String fileType = pres.getFileType();

      if (SupportedFileTypes.isOfficeFile(fileType)) {
        pres = officeToPdfConversionService.convertOfficeToPdf(pres);
        OfficeToPdfConversionSuccessFilter ocsf = new OfficeToPdfConversionSuccessFilter(gw);
        if (ocsf.didConversionSucceed(pres)) {
          ocsf.sendProgress(pres);
          // Successfully converted to pdf. Call the process again, this time it
          // should be handled by
          // the PDF conversion service.
          processDocument(pres);
        } else {
          // Send notification that office to pdf conversion failed.
          // The cause should have been set by the previous step.
          // (ralam feb 15, 2020)
          ocsf.sendProgress(pres);
        }
      } else if (SupportedFileTypes.isPdfFile(fileType)) {
          determineNumberOfPages(pres);
          sendDocConversionNumPagesFoundProgress(pres);
          pdfToSwfSlidesGenerationService.generateSlides(pres);
      } else if (SupportedFileTypes.isImageFile(fileType)) {
          pres.setNumberOfPages(1); // There should be only one image to convert.
          sendDocConversionNumPagesFoundProgress(pres);
          imageToSwfSlidesGenerationService.generateSlides(pres);
      } else {
          Map<String, Object> logData = new HashMap<String, Object>();
          logData = new HashMap<String, Object>();
          logData.put("podId", pres.getPodId());
          logData.put("meetingId", pres.getMeetingId());
          logData.put("presId", pres.getId());
          logData.put("filename", pres.getName());
          logData.put("current", pres.isCurrent());
          logData.put("logCode", "supported_file_not_handled");
          logData.put("message", "Supported file not handled.");

          Gson gson = new Gson();
          String logStr = gson.toJson(logData);
          log.warn(" --analytics-- data={}", logStr);
      }

    } else {
        Map<String, Object> logData = new HashMap<String, Object>();
        logData = new HashMap<String, Object>();
        logData.put("podId", pres.getPodId());
        logData.put("meetingId", pres.getMeetingId());
        logData.put("presId", pres.getId());
        logData.put("filename", pres.getName());
        logData.put("current", pres.isCurrent());
        logData.put("logCode", "unsupported_file_format");
        logData.put("message", "Unsupported file format");

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.error(" --analytics-- data={}", logStr);
    }

    Map<String, Object> logData = new HashMap<String, Object>();
    logData = new HashMap<String, Object>();
    logData.put("podId", pres.getPodId());
    logData.put("meetingId", pres.getMeetingId());
    logData.put("presId", pres.getId());
    logData.put("filename", pres.getName());
    logData.put("current", pres.isCurrent());
    logData.put("logCode", "presentation_conversion_end");
    logData.put("message", "End presentation conversion.");

    Gson gson = new Gson();
    String logStr = gson.toJson(logData);
    log.info(" --analytics-- data={}", logStr);

    notifier.sendConversionCompletedMessage(pres);
  }

  private void sendDocConversionNumPagesFoundProgress(UploadedPresentation pres) {
      Map<String, Object> logData = new HashMap<String, Object>();

      logData.put("podId", pres.getPodId());
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("num_pages", pres.getNumberOfPages());
      logData.put("authzToken", pres.getAuthzToken());
      logData.put("logCode", "presentation_conversion_num_pages");
      logData.put("message", "Presentation conversion number of pages.");

      Gson gson = new Gson();
      String logStr = gson.toJson(logData);
      log.info(" --analytics-- data={}", logStr);

      DocPageConversionStarted progress = new DocPageConversionStarted(
              pres.getPodId(),
              pres.getMeetingId(),
              pres.getId(),
              pres.getName(),
              pres.getAuthzToken(),
              pres.isDownloadable(),
              pres.isCurrent(),
              pres.getNumberOfPages());
      notifier.sendDocConversionProgress(progress);
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

            DocConversionRequestReceived progress = new DocConversionRequestReceived(
                    pres.getPodId(),
                    pres.getMeetingId(),
                    pres.getId(),
                    pres.getName(),
                    pres.getAuthzToken(),
                    pres.isDownloadable(),
                    pres.isCurrent());
            notifier.sendDocConversionProgress(progress);
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
        ConversionUpdateMessage.MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);

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

            DocPageCountExceeded progress = new DocPageCountExceeded(pres.getPodId(), pres.getMeetingId(),
                    pres.getId(), pres.getId(),
                    pres.getName(), "notUsedYet", "notUsedYet",
                    pres.isDownloadable(), ConversionMessageConstants.PAGE_COUNT_EXCEEDED_KEY,
                    e.getPageCount(), e.getMaxNumberOfPages());

            notifier.sendDocConversionProgress(progress);
        }

    }

  public void setBbbWebApiGWApp(IBbbWebApiGWApp m) {
    gw = m;
  }

  public void setOfficeToPdfConversionService(OfficeToPdfConversionService s) {
    officeToPdfConversionService = s;
  }

  public void setPdfToSwfSlidesGenerationService(
      PdfToSwfSlidesGenerationService s) {
    pdfToSwfSlidesGenerationService = s;
  }

  public void setImageToSwfSlidesGenerationService(
      ImageToSwfSlidesGenerationService s) {
    imageToSwfSlidesGenerationService = s;
  }

  public void setSwfSlidesGenerationProgressNotifier(SwfSlidesGenerationProgressNotifier notifier) {
      this.notifier = notifier;
  }

  public void setCounterService(PageCounterService counterService) {
      this.counterService = counterService;
  }
}
