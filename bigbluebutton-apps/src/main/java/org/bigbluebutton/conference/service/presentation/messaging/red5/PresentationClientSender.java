package org.bigbluebutton.conference.service.presentation.messaging.red5;

import java.util.ArrayList;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;

public class PresentationClientSender implements OutMessageListener {
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
    
	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService service) {
		this.service = service;
	}
	
	@Override
	public void send(OutMessage msg) {
		
	}
	
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
	
	
	public void removePresentation(String name){
	   log.debug("calling removePresentationCallback " + name);
	   ArrayList list=new ArrayList();
	   list.add(name);
	   so.sendMessage("removePresentationCallback", list);
	}
	
	public void gotoSlide(int slide){
		log.debug("calling gotoSlideCallback " + slide);
		ArrayList list=new ArrayList();
		list.add(slide);
		so.sendMessage("gotoSlideCallback", list);	
	}
	
	public void sharePresentation(String presentationName, Boolean share){
		log.debug("calling sharePresentationCallback " + presentationName + " " + share);
		ArrayList list=new ArrayList();
		list.add(presentationName);
		list.add(share);
		so.sendMessage("sharePresentationCallback", list);
	}
	

	public void sendCursorUpdate(Double xPercent, Double yPercent) {
		// Disable. We are using connection invoke now. (ralam Oct 1, 2012).
		// We'll have to convert all other messages to use conn invoke soon.
		
//		log.debug("calling updateCursorCallback[" + xPercent + "," + yPercent + "]");
//		ArrayList list=new ArrayList();
//		list.add(xPercent);
//		list.add(yPercent);
//		so.sendMessage("updateCursorCallback", list);
	}

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
