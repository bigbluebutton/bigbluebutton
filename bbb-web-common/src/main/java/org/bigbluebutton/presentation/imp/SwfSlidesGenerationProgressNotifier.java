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

package org.bigbluebutton.presentation.imp;

import java.util.Map;

import org.bigbluebutton.api.messaging.MessagingConstants;
import org.bigbluebutton.api.messaging.MessagingService;
import org.bigbluebutton.presentation.ConversionMessageConstants;
import org.bigbluebutton.presentation.ConversionUpdateMessage;
import org.bigbluebutton.presentation.ConversionUpdateMessage.MessageBuilder;
import org.bigbluebutton.presentation.GeneratedSlidesInfoHelper;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class SwfSlidesGenerationProgressNotifier {
	private static Logger log = LoggerFactory.getLogger(SwfSlidesGenerationProgressNotifier.class);

	private MessagingService messagingService;
	
	private GeneratedSlidesInfoHelper generatedSlidesInfoHelper;
			
	private void notifyProgressListener(Map<String, Object> msg) {	
		if(messagingService != null){
			Gson gson= new Gson();
			String updateMsg = gson.toJson(msg);
			messagingService.send(MessagingConstants.TO_PRESENTATION_CHANNEL, updateMsg);
		} else {
			log.warn("MessagingService has not been set");
		}
	}

	public void sendConversionUpdateMessage(Map<String, Object> message) {
		notifyProgressListener(message);
	}
	
	public void sendConversionUpdateMessage(int slidesCompleted, UploadedPresentation pres) {
		MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);
		builder.messageKey(ConversionMessageConstants.GENERATED_SLIDE_KEY);
		builder.numberOfPages(pres.getNumberOfPages());
		builder.pagesCompleted(slidesCompleted);
		notifyProgressListener(builder.build().getMessage());
	}
	
	public void sendCreatingThumbnailsUpdateMessage(UploadedPresentation pres) {
		MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);
		builder.messageKey(ConversionMessageConstants.GENERATING_THUMBNAIL_KEY);
		notifyProgressListener(builder.build().getMessage());		
	}
	
	public void sendConversionCompletedMessage(UploadedPresentation pres) {	
		if (generatedSlidesInfoHelper == null) {
			log.error("GeneratedSlidesInfoHelper was not set. Could not notify interested listeners.");
			return;
		}
		
		MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);
		builder.messageKey(ConversionMessageConstants.CONVERSION_COMPLETED_KEY);		
		builder.numberOfPages(pres.getNumberOfPages());
		builder.presBaseUrl(pres);
		notifyProgressListener(builder.build().getMessage());	
	}
	
	public void setMessagingService(MessagingService m) {
		messagingService = m;
	}
	
	public void setGeneratedSlidesInfoHelper(GeneratedSlidesInfoHelper helper) {
		generatedSlidesInfoHelper = helper;
	}

	public void sendCreatingTextFilesUpdateMessage(UploadedPresentation pres) {
		MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);
		builder.messageKey(ConversionMessageConstants.GENERATING_TEXTFILES_KEY);
		notifyProgressListener(builder.build().getMessage());	
	}

	public void sendCreatingSvgImagesUpdateMessage(UploadedPresentation pres) {
		MessageBuilder builder = new ConversionUpdateMessage.MessageBuilder(pres);
		builder.messageKey(ConversionMessageConstants.GENERATING_SVGIMAGES_KEY);
		notifyProgressListener(builder.build().getMessage());
	}
}
