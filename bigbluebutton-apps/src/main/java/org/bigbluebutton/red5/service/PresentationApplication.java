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
package org.bigbluebutton.red5.service;

import org.slf4j.Logger;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;

public class PresentationApplication {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationApplication.class, "bigbluebutton" );

	private MessagePublisher red5BBBInGW;

	public void setRed5Publisher(MessagePublisher inGW) {
		red5BBBInGW = inGW;
	}

	public void clear(String meetingID) {
	}

	public void sendConversionUpdate(String messageKey, String meetingId,
			String code, String presentationId, String presName) {

		red5BBBInGW.sendConversionUpdate(messageKey, meetingId, code,
				presentationId, presName);
	}

	public void sendPageCountError(String messageKey, String meetingId, 
			String code, String presentationId, int numberOfPages,
			int maxNumberPages, String presName) {

		red5BBBInGW.sendPageCountError(messageKey, meetingId, code, 
						presentationId, numberOfPages, maxNumberPages, presName);
	}

	public void sendSlideGenerated(String messageKey, String meetingId,
			String code, String presentationId, int numberOfPages,
			int pagesCompleted, String presName) {

		red5BBBInGW.sendSlideGenerated(messageKey, meetingId, code, 
				presentationId, numberOfPages, pagesCompleted, presName);
	}

	public void sendConversionCompleted(String messageKey, String meetingId,
			String code, String presentation, int numberOfPages,
			String presName, String presBaseUrl) {

		red5BBBInGW.sendConversionCompleted(messageKey, meetingId,
				code, presentation, numberOfPages, presName, presBaseUrl);
	}

	public void removePresentation(String meetingID, String presentationID){

		red5BBBInGW.removePresentation(meetingID, presentationID);
	}

	public void getPresentationInfo(String meetingID, String requesterID) {
		// Just hardcode as we don't really need it for flash client. (ralam may 7, 2014)
		String replyTo = meetingID + "/" + requesterID; 

		red5BBBInGW.getPresentationInfo(meetingID, requesterID, replyTo);
	}

	public void sendCursorUpdate(String meetingID, Double xPercent, Double yPercent) {	

		red5BBBInGW.sendCursorUpdate(meetingID, xPercent, yPercent);
	}

	public void resizeAndMoveSlide(String meetingID, Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {

		red5BBBInGW.resizeAndMoveSlide(meetingID, xOffset, yOffset, widthRatio, heightRatio);
	}

	public void gotoSlide(String meetingID, String pageId){

		red5BBBInGW.gotoSlide(meetingID, pageId);
	}

	public void sharePresentation(String meetingID, String presentationID, Boolean share){

		red5BBBInGW.sharePresentation(meetingID, presentationID, share);
	}

	public void getSlideInfo(String meetingID, String requesterID) {
		// Just hardcode as we don't really need it for flash client. (ralam may 7, 2014)

		String replyTo = meetingID + "/" + requesterID; 
		red5BBBInGW.getSlideInfo(meetingID, requesterID,  replyTo);
	}
}