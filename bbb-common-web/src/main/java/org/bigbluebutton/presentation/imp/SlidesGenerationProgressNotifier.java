/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.presentation.imp;

import org.bigbluebutton.api.messaging.messages.PresentationUploadToken;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.presentation.ConversionMessageConstants;
import org.bigbluebutton.presentation.GeneratedSlidesInfoHelper;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.messages.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SlidesGenerationProgressNotifier {
  private static Logger log = LoggerFactory.getLogger(SlidesGenerationProgressNotifier.class);

  private IBbbWebApiGWApp messagingService;
  private int maxNumberOfAttempts = 3;
  private GeneratedSlidesInfoHelper generatedSlidesInfoHelper;


  public void sendDocConversionProgress(IDocConversionMsg msg) {
    messagingService.sendDocConversionMsg(msg);
  }

  public void sendUploadFileTooLargeMessage(PresentationUploadToken pres, int uploadedFileSize, int maxUploadFileSize) {
    UploadFileTooLargeMessage progress = new UploadFileTooLargeMessage(
            pres.podId,
            pres.meetingId,
            pres.filename,
            pres.authzToken,
            ConversionMessageConstants.FILE_TOO_LARGE,
            uploadedFileSize,
            maxUploadFileSize);
    messagingService.sendDocConversionMsg(progress);
  }
  public void sendInvalidMimeTypeMessage(UploadedPresentation pres, String fileMime, String fileExtension) {
    DocInvalidMimeType invalidMimeType = new DocInvalidMimeType(
            pres.getPodId(),
            pres.getMeetingId(),
            pres.getId(),
            pres.getTemporaryPresentationId(),
            pres.getName(),
            pres.getAuthzToken(),
            "IVALID_MIME_TYPE",
            fileMime,
            fileExtension
    );
    messagingService.sendDocConversionMsg(invalidMimeType);
  }

  public void sendUploadFileTimedout(UploadedPresentation pres, int page) {
    UploadFileTimedoutMessage errorMessage = new UploadFileTimedoutMessage(
            pres.getPodId(),
            pres.getMeetingId(),
            pres.getName(),
            ConversionMessageConstants.CONVERSION_TIMEOUT_KEY,
            page, pres.getTemporaryPresentationId(), pres.getId(), maxNumberOfAttempts);
    messagingService.sendDocConversionMsg(errorMessage);
  }

  public void sendConversionUpdateMessage(int slidesCompleted, UploadedPresentation pres, int pageGenerated) {
    DocPageGeneratedProgress progress = new DocPageGeneratedProgress(pres.getPodId(),
            pres.getMeetingId(),
            pres.getId(),
            pres.getId(),
            pres.getName(),
            "notUsedYet",
            "notUsedYet",
            pres.isDownloadable(),
            pres.isRemovable(),
            ConversionMessageConstants.GENERATED_SLIDE_KEY,
            pres.getNumberOfPages(),
            slidesCompleted,
            generateBasePresUrl(pres),
            pageGenerated,
            (pageGenerated == 1));
    messagingService.sendDocConversionMsg(progress);
  }

  public void sendCreatingThumbnailsUpdateMessage(UploadedPresentation pres) {
    DocConversionProgress progress = new DocConversionProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), pres.isRemovable(), ConversionMessageConstants.GENERATING_THUMBNAIL_KEY,
      pres.getTemporaryPresentationId());
    messagingService.sendDocConversionMsg(progress);
  }

  public void sendConversionCompletedMessage(UploadedPresentation pres) {
    if (generatedSlidesInfoHelper == null) {
      log.error("GeneratedSlidesInfoHelper was not set. Could not notify interested listeners.");
      return;
    }

    DocPageCompletedProgress progress = new DocPageCompletedProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getTemporaryPresentationId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), pres.isRemovable(), ConversionMessageConstants.CONVERSION_COMPLETED_KEY,
      pres.getNumberOfPages(), generateBasePresUrl(pres), pres.isCurrent(), pres.getIsInitialPresentation());
    messagingService.sendDocConversionMsg(progress);
  }

  private String generateBasePresUrl(UploadedPresentation pres) {
    return pres.getBaseUrl() + "/" + pres.getMeetingId() + "/" + pres.getMeetingId() + "/" + pres.getId();
  }

  public void setMessagingService(IBbbWebApiGWApp m) {
    messagingService = m;
  }

  public void setMaxNumberOfAttempts(int maxNumberOfAttempts) {
    this.maxNumberOfAttempts = maxNumberOfAttempts;
  }

  public void setGeneratedSlidesInfoHelper(GeneratedSlidesInfoHelper helper) {
    generatedSlidesInfoHelper = helper;
  }

  public void sendCreatingTextFilesUpdateMessage(UploadedPresentation pres) {
    DocConversionProgress progress = new DocConversionProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), pres.isRemovable(), ConversionMessageConstants.GENERATING_TEXTFILES_KEY,
      pres.getTemporaryPresentationId());
    messagingService.sendDocConversionMsg(progress);
  }

  public void sendCreatingSvgImagesUpdateMessage(UploadedPresentation pres) {
    DocConversionProgress progress = new DocConversionProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), pres.isRemovable(), ConversionMessageConstants.GENERATING_SVGIMAGES_KEY,
      pres.getTemporaryPresentationId());
    messagingService.sendDocConversionMsg(progress);
  }
}
