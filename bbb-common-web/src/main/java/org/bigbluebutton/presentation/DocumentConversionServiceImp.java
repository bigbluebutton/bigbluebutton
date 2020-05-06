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

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.presentation.imp.*;
import org.bigbluebutton.presentation.messages.DocConversionRequestReceived;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.bigbluebutton.api.Util;
import com.google.gson.Gson;

public class DocumentConversionServiceImp implements DocumentConversionService {
  private static Logger log = LoggerFactory.getLogger(DocumentConversionServiceImp.class);

  private IBbbWebApiGWApp gw;
  private OfficeToPdfConversionService officeToPdfConversionService;
  private SwfSlidesGenerationProgressNotifier notifier;

  private PresentationFileProcessor presentationFileProcessor;

  public void processDocument(UploadedPresentation pres) {
    if (pres.isUploadFailed()) {
      // We should send a message to the client in the future.
      // ralam may 1, 2020
      log.error("Presentation upload failed for meetingId={} presId={}", pres.getMeetingId(), pres.getId());
      log.error("Presentation upload fail reasons {}", pres.getUploadFailReason());
      return;
    }

    sendDocConversionRequestReceived(pres);

    processDocumentStart(pres);
  }

  public void processDocumentStart(UploadedPresentation pres) {
    SupportedDocumentFilter sdf = new SupportedDocumentFilter(gw);
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
          processDocumentStart(pres);
        } else {
          // Send notification that office to pdf conversion failed.
          // The cause should have been set by the previous step.
          // (ralam feb 15, 2020)
          ocsf.sendProgress(pres);
        }
      } else if (SupportedFileTypes.isPdfFile(fileType)) {
        presentationFileProcessor.process(pres);
      } else if (SupportedFileTypes.isImageFile(fileType)) {
        presentationFileProcessor.process(pres);
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

      logData.clear();

      logData.put("podId", pres.getPodId());
      logData.put("meetingId", pres.getMeetingId());
      logData.put("presId", pres.getId());
      logData.put("filename", pres.getName());
      logData.put("current", pres.isCurrent());
      logData.put("logCode", "presentation_conversion_end");
      logData.put("message", "End presentation conversion.");

      logStr = gson.toJson(logData);
      log.info(" --analytics-- data={}", logStr);

      notifier.sendConversionCompletedMessage(pres);
    }
  }

  private void sendDocConversionRequestReceived(UploadedPresentation pres) {
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

  public void setBbbWebApiGWApp(IBbbWebApiGWApp m) {
    gw = m;
  }

  public void setOfficeToPdfConversionService(OfficeToPdfConversionService s) {
    officeToPdfConversionService = s;
  }

  public void setSwfSlidesGenerationProgressNotifier(SwfSlidesGenerationProgressNotifier notifier) {
      this.notifier = notifier;
  }

  public void setPresentationFileProcessor(PresentationFileProcessor presentationFileProcessor) {
      this.presentationFileProcessor = presentationFileProcessor;
  }
}
