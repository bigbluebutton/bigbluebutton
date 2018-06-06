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

import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.presentation.ConversionMessageConstants;
import org.bigbluebutton.presentation.GeneratedSlidesInfoHelper;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.messages.DocPageCompletedProgress;
import org.bigbluebutton.presentation.messages.DocPageGeneratedProgress;
import org.bigbluebutton.presentation.messages.IDocConversionMsg;
import org.bigbluebutton.presentation.messages.OfficeDocConversionProgress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SwfSlidesGenerationProgressNotifier {
  private static Logger log = LoggerFactory.getLogger(SwfSlidesGenerationProgressNotifier.class);

  private IBbbWebApiGWApp messagingService;

  private GeneratedSlidesInfoHelper generatedSlidesInfoHelper;


  public void sendDocConversionProgress(IDocConversionMsg msg) {
    messagingService.sendDocConversionMsg(msg);
  }


  public void sendConversionUpdateMessage(int slidesCompleted, UploadedPresentation pres) {
    DocPageGeneratedProgress progress = new DocPageGeneratedProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), ConversionMessageConstants.GENERATED_SLIDE_KEY,
      pres.getNumberOfPages(), slidesCompleted);
    messagingService.sendDocConversionMsg(progress);
  }

  public void sendCreatingThumbnailsUpdateMessage(UploadedPresentation pres) {
    OfficeDocConversionProgress progress = new OfficeDocConversionProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), ConversionMessageConstants.GENERATING_THUMBNAIL_KEY);
    messagingService.sendDocConversionMsg(progress);
  }

  public void sendConversionCompletedMessage(UploadedPresentation pres) {
    if (generatedSlidesInfoHelper == null) {
      log.error("GeneratedSlidesInfoHelper was not set. Could not notify interested listeners.");
      return;
    }

    DocPageCompletedProgress progress = new DocPageCompletedProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), ConversionMessageConstants.CONVERSION_COMPLETED_KEY,
      pres.getNumberOfPages(), generateBasePresUrl(pres), pres.isCurrent());
    messagingService.sendDocConversionMsg(progress);
  }

  private String generateBasePresUrl(UploadedPresentation pres) {
    return pres.getBaseUrl() + "/" + pres.getMeetingId() + "/" + pres.getMeetingId() + "/" + pres.getId();
  }

  public void setMessagingService(IBbbWebApiGWApp m) {
    messagingService = m;
  }

  public void setGeneratedSlidesInfoHelper(GeneratedSlidesInfoHelper helper) {
    generatedSlidesInfoHelper = helper;
  }

  public void sendCreatingTextFilesUpdateMessage(UploadedPresentation pres) {
    OfficeDocConversionProgress progress = new OfficeDocConversionProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), ConversionMessageConstants.GENERATING_TEXTFILES_KEY);
    messagingService.sendDocConversionMsg(progress);
  }

  public void sendCreatingSvgImagesUpdateMessage(UploadedPresentation pres) {
    OfficeDocConversionProgress progress = new OfficeDocConversionProgress(pres.getPodId(), pres.getMeetingId(),
      pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), ConversionMessageConstants.GENERATING_SVGIMAGES_KEY);
    messagingService.sendDocConversionMsg(progress);
  }
}
