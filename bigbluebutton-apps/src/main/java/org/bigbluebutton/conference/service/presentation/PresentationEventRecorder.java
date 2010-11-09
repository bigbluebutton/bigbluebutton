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
import org.bigbluebutton.conference.service.recorder.IEventRecorder;
import org.bigbluebutton.conference.service.recorder.IRecorder;import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;

public class PresentationEventRecorder implements IEventRecorder, IPresentationRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationEventRecorder.class, "bigbluebutton" );

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
    
	IRecorder recorder;
	private ISharedObject so;
	private final Boolean record;
	
	String APP_NAME = "PRESENTATION";
	
	private final String RECORD_EVENT_SHARE_PRESENTATION="share_presentation";
	private final String RECORD_EVENT_ASSIGN_PRESENTER="assign_presenter";
	private final String RECORD_EVENT_REMOVE_PRESENTATION="remove_presentation";
	private final String RECORD_EVENT_RESIZE_MOVE_SLIDE="resize_move_slide";
	private final String RECORD_EVENT_UPDATE_SLIDE="update_slide";
	private final String RECORD_EVENT_CONVERSION_STATUS="conversion_status";
	private final String RECORD_EVENT_PAGE_COUNT_EXCEEDED="page_count_exceeded";
	private final String RECORD_EVENT_GENERATED_SLIDE="generated_slide";
	private final String RECORD_EVENT_CONVERSION_COMPLETE="conversion_complete";
	
	public void acceptRecorder(IRecorder recorder){
		log.debug("Accepting IRecorder");
		this.recorder = recorder;
	}
	
	public String getName() {
		return APP_NAME;
	}
	
	public void recordEvent(String message){
		if (record) {
			recorder.recordEvent(message);
		}
	}
	
	public PresentationEventRecorder(ISharedObject so, Boolean record) {
		this.so = so; 
		this.record = record;
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
		
		if(messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_SUCCESS_KEY)||
				messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_FAILED_KEY)||
				messageKey.equalsIgnoreCase(SUPPORTED_DOCUMENT_KEY)||
				messageKey.equalsIgnoreCase(UNSUPPORTED_DOCUMENT_KEY)||
				messageKey.equalsIgnoreCase(GENERATING_THUMBNAIL_KEY)||
				messageKey.equalsIgnoreCase(GENERATED_THUMBNAIL_KEY)||
				messageKey.equalsIgnoreCase(PAGE_COUNT_FAILED_KEY)){
			log.debug("{}[{}]",messageKey,presentationName);
			// no extra data to send
			so.sendMessage("conversionUpdateMessageCallback", list);
			recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_CONVERSION_STATUS));
		}
		else if(messageKey.equalsIgnoreCase(PAGE_COUNT_EXCEEDED_KEY)){
			log.debug("{}[{}]",messageKey,presentationName);
			list.add(message.get("numberOfPages"));
			list.add(message.get("maxNumberPages"));
			so.sendMessage("pageCountExceededUpdateMessageCallback", list);
			recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_PAGE_COUNT_EXCEEDED));
		}
		else if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
			log.debug("{}[{}]",messageKey,presentationName);
			list.add(message.get("numberOfPages"));
			list.add(message.get("pagesCompleted"));
			so.sendMessage("generatedSlideUpdateMessageCallback", list);
			recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_GENERATED_SLIDE));
		}
		else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
			log.debug("{}[{}]",messageKey,presentationName);
			list.add(message.get("slidesInfo"));								
			so.sendMessage("conversionCompletedUpdateMessageCallback", list);
			recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_CONVERSION_COMPLETE));
		}
		else{
			log.error("Cannot handle recieved message.");
		}			
	}
	
	
	@SuppressWarnings("unchecked")
	public void removePresentation(String name){
	   log.debug("calling removePresentationCallback {}",name);
	   ArrayList list=new ArrayList();
	   list.add(name);
	   so.sendMessage("removePresentationCallback", list);
	   recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_REMOVE_PRESENTATION));
	}
	
	@SuppressWarnings("unchecked")
	public void gotoSlide(int slide){
		log.debug("calling gotoSlideCallback {}",slide);
		ArrayList list=new ArrayList();
		list.add(slide);
		so.sendMessage("gotoSlideCallback", list);	
		recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_UPDATE_SLIDE));
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public void sharePresentation(String presentationName, Boolean share){
		log.debug("calling sharePresentationCallback {} {}",presentationName,share);
		ArrayList list=new ArrayList();
		list.add(presentationName);
		list.add(share);
		so.sendMessage("sharePresentationCallback", list);
		recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_SHARE_PRESENTATION));
	}

	@SuppressWarnings("unchecked")
	@Override
	public void assignPresenter(ArrayList presenter) {
		log.debug("calling assignPresenterCallback "+presenter.get(0)+", "+presenter.get(1)+" "+presenter.get(2));
		so.sendMessage("assignPresenterCallback", presenter);
		recordEvent(parsePresentationToJSON(presenter, this.RECORD_EVENT_ASSIGN_PRESENTER));
	}

	@SuppressWarnings("unchecked")
	@Override
	public void resizeAndMoveSlide(Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		log.debug("calling moveCallback["+xOffset+","+yOffset+","+widthRatio+","+heightRatio+"]");
		ArrayList list=new ArrayList();
		list.add(xOffset);
		list.add(yOffset);
		list.add(widthRatio);
		list.add(heightRatio);
		so.sendMessage("moveCallback", list);
		recordEvent(parsePresentationToJSON(list, this.RECORD_EVENT_RESIZE_MOVE_SLIDE));
	}
	
	private String parsePresentationToJSON(ArrayList list, String type){
		String json="{ ";
		json+="\"module\":\"presentation\", ";
		
		if(type.equalsIgnoreCase(this.RECORD_EVENT_ASSIGN_PRESENTER)){
			json+="\"event\":\""+this.RECORD_EVENT_ASSIGN_PRESENTER+"\", ";
			json+="\"userid\":\""+list.get(0)+"\", ";
			json+="\"name\":\""+list.get(1)+"\", ";
			json+="\"assignedBy\":\""+list.get(2)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_REMOVE_PRESENTATION)){
			json+="\"event\":\""+this.RECORD_EVENT_REMOVE_PRESENTATION+"\", ";
			json+="\"presentationName\":\""+list.get(0)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_RESIZE_MOVE_SLIDE)){
			json+="\"event\":\""+this.RECORD_EVENT_RESIZE_MOVE_SLIDE+"\", ";
			json+="\"xOffset\":\""+list.get(0)+"\", ";
			json+="\"yOffset\":\""+list.get(1)+"\", ";
			json+="\"widthRatio\":\""+list.get(2)+"\", ";
			json+="\"heightRatio\":\""+list.get(3)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_SHARE_PRESENTATION)){
			json+="\"event\":\""+this.RECORD_EVENT_SHARE_PRESENTATION+"\", ";
			json+="\"presentationName\":\""+list.get(0)+"\", ";
			json+="\"share\":\""+list.get(1)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_UPDATE_SLIDE)){
			json+="\"event\":\""+this.RECORD_EVENT_UPDATE_SLIDE+"\", ";
			json+="\"slide\":\""+list.get(0)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_CONVERSION_STATUS)){
			json+="\"event\":\""+this.RECORD_EVENT_CONVERSION_STATUS+"\", ";
			json+="\"code\":\""+list.get(2)+"\", ";
			json+="\"presentationName\":\""+list.get(3)+"\", ";
			json+="\"messageKey\":\""+list.get(4)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_PAGE_COUNT_EXCEEDED)){
			json+="\"event\":\""+this.RECORD_EVENT_PAGE_COUNT_EXCEEDED+"\", ";
			json+="\"code\":\""+list.get(2)+"\", ";
			json+="\"presentationName\":\""+list.get(3)+"\", ";
			json+="\"messageKey\":\""+list.get(4)+"\", ";
			json+="\"numberOfPages\":\""+list.get(5)+"\", ";
			json+="\"maxNumberPages\":\""+list.get(6)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_GENERATED_SLIDE)){
			json+="\"event\":\""+this.RECORD_EVENT_GENERATED_SLIDE+"\", ";
			json+="\"code\":\""+list.get(2)+"\", ";
			json+="\"presentationName\":\""+list.get(3)+"\", ";
			json+="\"messageKey\":\""+list.get(4)+"\", ";
			json+="\"numberOfPages\":\""+list.get(5)+"\", ";
			json+="\"pagesCompleted\":\""+list.get(6)+"\" ";
		}
		else if(type.equalsIgnoreCase(this.RECORD_EVENT_CONVERSION_COMPLETE)){
			json+="\"event\":\""+this.RECORD_EVENT_CONVERSION_COMPLETE+"\", ";
			json+="\"code\":\""+list.get(2)+"\", ";
			json+="\"presentationName\":\""+list.get(3)+"\", ";
			json+="\"messageKey\":\""+list.get(4)+"\", ";
			json+="\"slidesInfo\":\""+list.get(5)+"\" ";
		}
		
		json+="}";
		return json;
	}
}
