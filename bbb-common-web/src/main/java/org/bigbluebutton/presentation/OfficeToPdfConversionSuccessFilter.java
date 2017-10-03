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
import org.bigbluebutton.presentation.messages.OfficeDocConversionProgress;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class OfficeToPdfConversionSuccessFilter {
  private static Logger log = LoggerFactory.getLogger(OfficeToPdfConversionSuccessFilter.class);

  private final IBbbWebApiGWApp gw;

  private static Map<String, String> conversionMessagesMap;

  public OfficeToPdfConversionSuccessFilter(IBbbWebApiGWApp m) {
    gw = m;
    conversionMessagesMap = new HashMap<String, String>();
    conversionMessagesMap.put(
        ConversionMessageConstants.OFFICE_DOC_CONVERSION_SUCCESS_KEY,
        "Office document successfully converted.");
    conversionMessagesMap.put(
        ConversionMessageConstants.OFFICE_DOC_CONVERSION_FAILED_KEY,
        "Failed to convert Office document.");
    conversionMessagesMap.put(
        ConversionMessageConstants.OFFICE_DOC_CONVERSION_INVALID_KEY,
        "Invalid Office document detected, it will not be converted.");
  }

  public boolean didConversionSucceed(UploadedPresentation pres) {
    notifyProgressListener(pres);
    return pres
        .getConversionStatus() == ConversionMessageConstants.OFFICE_DOC_CONVERSION_SUCCESS_KEY;
  }

  private void notifyProgressListener(UploadedPresentation pres) {
    Map<String, Object> msg = new HashMap<String, Object>();
    msg.put("conference", pres.getMeetingId());
    msg.put("room", pres.getMeetingId());
    msg.put("returnCode", "CONVERT");
    msg.put("presentationId", pres.getId());
    msg.put("podId", pres.getPodId());
    msg.put("presentationName", pres.getId());
    msg.put("filename", pres.getName());
    msg.put("message", conversionMessagesMap.get(pres.getConversionStatus()));
    msg.put("messageKey", pres.getConversionStatus());

    log.info("Notifying of " + pres.getConversionStatus() + " for "
        + pres.getUploadedFile().getAbsolutePath());
    sendProgress(pres);
  }


  public void sendProgress(UploadedPresentation pres) {
    OfficeDocConversionProgress progress = new OfficeDocConversionProgress(pres.getPodId(),
      pres.getMeetingId(),pres.getId(), pres.getId(),
      pres.getName(), "notUsedYet", "notUsedYet",
      pres.isDownloadable(), pres.getConversionStatus());
    gw.sendDocConversionMsg(progress);
  }

}
