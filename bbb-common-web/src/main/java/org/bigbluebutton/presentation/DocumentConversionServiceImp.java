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
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.presentation.imp.*;
import org.bigbluebutton.presentation.messages.DocConversionRequestReceived;
import org.bigbluebutton.presentation.messages.DocInvalidMimeType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.gson.Gson;
import xyz.capybara.clamav.ClamavClient;
import xyz.capybara.clamav.commands.scan.result.ScanResult;

import static org.bigbluebutton.presentation.Util.deleteDirectoryFromFileHandlingErrors;

public class DocumentConversionServiceImp implements DocumentConversionService {
  private static final String CLAMAV_HOST = "localhost";
  private static final Integer CLAMAV_PORT = 3310;

  private static Logger log = LoggerFactory.getLogger(DocumentConversionServiceImp.class);

  private IBbbWebApiGWApp gw;
  private OfficeToPdfConversionService officeToPdfConversionService;
  private SlidesGenerationProgressNotifier notifier;

  private PresentationFileProcessor presentationFileProcessor;

  public void processDocument(UploadedPresentation pres, boolean scanUploadedPresentationFiles) {
    if (pres.isUploadFailed()) {
      // We should send a message to the client in the future.
      // ralam may 1, 2020
      log.error("Presentation upload failed for meetingId={} presId={}", pres.getMeetingId(), pres.getId());
      log.error("Presentation upload fail reasons {}", pres.getUploadFailReason());
      return;
    }

    if (scanUploadedPresentationFiles) {
      try {
        ClamavClient client = new ClamavClient(CLAMAV_HOST, CLAMAV_PORT);
        ScanResult result = client.scan(Path.of(pres.getUploadedFile().getAbsolutePath()));

        if (result instanceof ScanResult.VirusFound) {
          log.error("Presentation upload failed for meetingId={} presId={}", pres.getMeetingId(), pres.getId());
          log.error("Presentation upload failed because a virus was detected in the uploaded file");
          notifier.sendUploadFileVirus(pres);
          Util.deleteDirectoryFromFileHandlingErrors(pres.getUploadedFile());
          return;
        }
      } catch (Exception e) {
        log.error("Failed to scan uploaded file for meetingId={} presID={}: {}", pres.getMeetingId(), pres.getId(), e.getMessage());
        notifier.sendUploadFileScanFailed(pres);
        Util.deleteDirectoryFromFileHandlingErrors(pres.getUploadedFile());
        return;
      }
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
        logData.put("removable", pres.isRemovable());

        Gson gson = new Gson();
        String logStr = gson.toJson(logData);
        log.warn(" --analytics-- data={}", logStr);
      }

    } else {
      File presentationFile = pres.getUploadedFile();
      deleteDirectoryFromFileHandlingErrors(presentationFile);

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

  public void sendDocConversionFailedOnMimeType(UploadedPresentation pres, String fileMime,
                                                String fileExtension) {
    notifier.sendInvalidMimeTypeMessage(pres, fileMime, fileExtension);
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
          logData.put("isRemovable", pres.isRemovable());

          Gson gson = new Gson();
          String logStr = gson.toJson(logData);
          log.info(" --analytics-- data={}", logStr);

          pres.startConversion();

          DocConversionRequestReceived progress = new DocConversionRequestReceived(
                  pres.getPodId(),
                  pres.getMeetingId(),
                  pres.getId(),
                  pres.getTemporaryPresentationId(),
                  pres.getName(),
                  pres.getAuthzToken(),
                  pres.isDownloadable(),
                  pres.isRemovable(),
                  pres.isCurrent()
          );
          notifier.sendDocConversionProgress(progress);
      }
  }

  public void setBbbWebApiGWApp(IBbbWebApiGWApp m) {
    gw = m;
  }

  public void setOfficeToPdfConversionService(OfficeToPdfConversionService s) {
    officeToPdfConversionService = s;
  }

  public void setSlidesGenerationProgressNotifier(SlidesGenerationProgressNotifier notifier) {
      this.notifier = notifier;
  }

  public void setPresentationFileProcessor(PresentationFileProcessor presentationFileProcessor) {
      this.presentationFileProcessor = presentationFileProcessor;
  }
}
