/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/

package org.bigbluebutton.conference.service.presentation;

import java.util.ArrayList;
import java.util.Map;
import org.bigbluebutton.conference.service.recorder.Recorder;import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class PresentationEventSender implements IPresentationRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationEventSender.class, "bigbluebutton" );

	private static final String OFFICE_DOC_CONVERSION_SUCCESS_KEY = "OFFICE_DOC_CONVERSION_SUCCESS";
    private static final String OFFICE_DOC_CONVERSION_FAILED_KEY = "OFFICE_DOC_CONVERSION_FAILED";
    private static final String SUPPORTED_DOCUMENT_KEY = "SUPPORTED_DOCUMENT";
    private static final String UNSUPPORTED_DOCUMENT_KEY = "UNSUPPORTED_DOCUMENT";
    private static final String PAGE_COUNT_FAILED_KEY = "PAGE_COUNT_FAILED";
    private static final String PAGE_COUNT_EXCEEDED_KEY = "PAGE_COUNT_EXCEEDED";	
    private static final String GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
    private static final String GENERATING_THUMBNAIL_KEY = "GENERATING_THUMBNAIL";
    private static final String GENERATED_THUMBNAIL_KEY = "GENERATED_THUMBNAIL";
    private static final String CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
    
	Recorder recorder;
	private ISharedObject so;
	
	String APP_NAME = "PRESENTATION";
	
	public void acceptRecorder(Recorder recorder){
		log.debug("Accepting IRecorder");
		this.recorder = recorder;
	}
	
	public String getName() {
		return APP_NAME;
	}
	

	public PresentationEventSender(ISharedObject so) {
		this.so = so;
	}
	
	@SuppressWarnings("unchecked")
	public void sendUpdateMessage(Map message){
		handleReceivedMessage(message);
	}

	@SuppressWarnings("unchecked")
	private void handleReceivedMessage(Map message){
    	String code = (String) message.get("returnCode");
    	String room = (String) message.get("room");
    	String presentationName = (String) message.get("presentationName");
    	String conference = (String) message.get("conference");
    	String messageKey = (String) message.get("messageKey");
    	
    	ArrayList<Object> list = new ArrayList<Object>();
		list.add(conference);
		list.add(room);
		list.add(code);
		list.add(presentationName);
		list.add(messageKey);
		
		log.debug("message " + messageKey + "[" + presentationName + "]");
		
		if(messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_SUCCESS_KEY)||
				messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_FAILED_KEY)||
				messageKey.equalsIgnoreCase(SUPPORTED_DOCUMENT_KEY)||
				messageKey.equalsIgnoreCase(UNSUPPORTED_DOCUMENT_KEY)||
				messageKey.equalsIgnoreCase(GENERATING_THUMBNAIL_KEY)||
				messageKey.equalsIgnoreCase(GENERATED_THUMBNAIL_KEY)||
				messageKey.equalsIgnoreCase(PAGE_COUNT_FAILED_KEY)){
			
			// no extra data to send
			so.sendMessage("conversionUpdateMessageCallback", list);
		}
		else if(messageKey.equalsIgnoreCase(PAGE_COUNT_EXCEEDED_KEY)){
			list.add(message.get("numberOfPages"));
			list.add(message.get("maxNumberPages"));
			so.sendMessage("pageCountExceededUpdateMessageCallback", list);
		}
		else if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
			list.add(message.get("numberOfPages"));
			list.add(message.get("pagesCompleted"));
			so.sendMessage("generatedSlideUpdateMessageCallback", list);
		}
		else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
			list.add(message.get("slidesInfo"));								
			so.sendMessage("conversionCompletedUpdateMessageCallback", list);
		}
		else{
			log.error("Cannot handle recieved message.");
		}			
	}
	
	
	@SuppressWarnings("unchecked")
	public void removePresentation(String name){
	   log.debug("calling removePresentationCallback " + name);
	   ArrayList list=new ArrayList();
	   list.add(name);
	   so.sendMessage("removePresentationCallback", list);
	}
	
	@SuppressWarnings("unchecked")
	public void gotoSlide(int slide){
		log.debug("calling gotoSlideCallback " + slide);
		ArrayList list=new ArrayList();
		list.add(slide);
		so.sendMessage("gotoSlideCallback", list);	
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public void sharePresentation(String presentationName, Boolean share){
		log.debug("calling sharePresentationCallback " + presentationName + " " + share);
		ArrayList list=new ArrayList();
		list.add(presentationName);
		list.add(share);
		so.sendMessage("sharePresentationCallback", list);
	}

	@SuppressWarnings("unchecked")
	@Override
	public void resizeAndMoveSlide(Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		log.debug("calling moveCallback[" + xOffset + "," + yOffset + "," + widthRatio + "," + heightRatio + "]");
		ArrayList list=new ArrayList();
		list.add(xOffset);
		list.add(yOffset);
		list.add(widthRatio);
		list.add(heightRatio);
		so.sendMessage("moveCallback", list);
	}
}
