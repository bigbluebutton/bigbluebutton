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

package org.bigbluebutton.presentation;

import java.io.File;

import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.bigbluebutton.presentation.ConversionUpdateMessage.MessageBuilder;
import org.bigbluebutton.presentation.messages.OfficeDocConversionProgress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class SupportedDocumentFilter {
  private static Logger log = LoggerFactory.getLogger(SupportedDocumentFilter.class);

  private final IBbbWebApiGWApp gw;

  public SupportedDocumentFilter(IBbbWebApiGWApp m) {
    gw = m;
  }

  public boolean isSupported(UploadedPresentation pres) {
    File presentationFile = pres.getUploadedFile();

    /* Get file extension - Perhaps try to rely on a more accurate method than an extension type ? */
    String extension = FilenameUtils.getExtension(presentationFile.getName());
    boolean supported = SupportedFileTypes.isFileSupported(extension);
    notifyProgressListener(supported, pres);
    if (supported) {
      log.info("Received supported file {}", pres.getUploadedFile().getAbsolutePath());
      pres.setFileType(extension);
    } else {
      log.warn("Received not supported file {}", pres.getUploadedFile().getAbsolutePath());
    }
    return supported;
  }

  private void notifyProgressListener(boolean supported, UploadedPresentation pres) {
    MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);

    String msgKey = ConversionMessageConstants.SUPPORTED_DOCUMENT_KEY;

    if (supported) {
      msgKey = ConversionMessageConstants.SUPPORTED_DOCUMENT_KEY;
    } else {
      msgKey = ConversionMessageConstants.UNSUPPORTED_DOCUMENT_KEY;
    }

    if (gw != null) {
      OfficeDocConversionProgress progress = new OfficeDocConversionProgress(pres.getPodId(), pres.getMeetingId(),
        pres.getId(), pres.getId(),
        pres.getName(), "notUsedYet", "notUsedYet",
        pres.isDownloadable(), msgKey);

      gw.sendDocConversionMsg(progress);

    } else {
      log.warn("MessagingService has not been set!");
    }
  }
}
