package org.bigbluebutton.conference.service.presentation.messaging.red5;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.ConversionUpdateMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.GetPresentationInforReplyMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.GotoSlideMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.PresentationCursorUpdateMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.RemovePresentationMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.ResizeAndMoveSlideMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.SharePresentationMessage;

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
		if (msg instanceof ConversionUpdateMessage) {
			sendUpdateMessage((ConversionUpdateMessage) msg);
		} else if (msg instanceof GetPresentationInforReplyMessage) {
			sendGetPresentationInfoReplyMessage((GetPresentationInforReplyMessage) msg);
		} else if (msg instanceof GotoSlideMessage) {
			sendGotoSlideMessage((GotoSlideMessage) msg);
		} else if (msg instanceof PresentationCursorUpdateMessage) {
			sendPresentationCursorUpdateMessage((PresentationCursorUpdateMessage) msg);
		} else if (msg instanceof RemovePresentationMessage) {
			sendRemovePresentationMessage((RemovePresentationMessage) msg);
		} else if (msg instanceof ResizeAndMoveSlideMessage) {
			sendResizeAndMoveSlideMessage((ResizeAndMoveSlideMessage) msg);
		} else if (msg instanceof SharePresentationMessage) {
			sendSharePresentationMessage((SharePresentationMessage) msg);
		}
	}
	
	private void sendPresentationCursorUpdateMessage(PresentationCursorUpdateMessage msg) {
		 Map<String, Object> args = new HashMap<String, Object>();
		 args.put("xPercent", msg.getxPercent());
		 args.put("yPercent", msg.getyPercent());

		BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "PresentationCursorUpdateCommand", args);
		service.sendMessage(m);	
	}
	
	private void sendGetPresentationInfoReplyMessage(GetPresentationInforReplyMessage msg) {
		
		DirectClientMessage m = new DirectClientMessage(msg.getMeetingID(), msg.getRequesterID(), "getPresentationInfoReply", msg.getInfo());
		service.sendMessage(m);		
	}
	
	private void sendUpdateMessage(ConversionUpdateMessage msg){

		Map<String, Object> message = msg.getMessage();
    	String code = (String) message.get("returnCode");
    	String presentationName = (String) message.get("presentationName");
    	String conference = (String) message.get("conference");
    	String messageKey = (String) message.get("messageKey");
    	
    	Map<String, Object> args = new HashMap<String, Object>();
		args.put("meetingID", conference);
		args.put("code", code);
		args.put("presentationID", presentationName);
		args.put("messageKey", messageKey);
		
		if (messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_SUCCESS_KEY)||
				messageKey.equalsIgnoreCase(OFFICE_DOC_CONVERSION_FAILED_KEY)||
				messageKey.equalsIgnoreCase(SUPPORTED_DOCUMENT_KEY)||
				messageKey.equalsIgnoreCase(UNSUPPORTED_DOCUMENT_KEY)||
				messageKey.equalsIgnoreCase(GENERATING_THUMBNAIL_KEY)||
				messageKey.equalsIgnoreCase(GENERATED_THUMBNAIL_KEY)||
				messageKey.equalsIgnoreCase(PAGE_COUNT_FAILED_KEY)){
			
			BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "conversionUpdateMessageCallback", args);
			service.sendMessage(m);
		} else if(messageKey.equalsIgnoreCase(PAGE_COUNT_EXCEEDED_KEY)){
			args.put("numberOfPages", message.get("numberOfPages"));
			args.put("maxNumberPages", message.get("maxNumberPages"));
			
			BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "pageCountExceededUpdateMessageCallback", args);
			service.sendMessage(m);
			
		} else if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
			args.put("numberOfPages", message.get("numberOfPages"));
			args.put("pagesCompleted", message.get("pagesCompleted"));
			
			BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "generatedSlideUpdateMessageCallback", args);
			service.sendMessage(m);			

		} else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
			args.put("slidesInfo", message.get("slidesInfo"));		
			
			BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "conversionCompletedUpdateMessageCallback", args);
			service.sendMessage(m);	
			
		} 			
	}
		
	private void sendRemovePresentationMessage(RemovePresentationMessage msg){
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("presentationID", msg.getPresentationID());


		BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "removePresentationCallback", args);
		service.sendMessage(m);
	}
	
	private void sendGotoSlideMessage(GotoSlideMessage msg){
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("pageNum", msg.getNum());
		
		BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "gotoSlideCallback", args);
		service.sendMessage(m);		
	}
	
	private void sendSharePresentationMessage(SharePresentationMessage msg){
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("presentationID", msg.getPresentationID());
		args.put("share", msg.getShare());
		
		BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "sharePresentationCallback", args);
		service.sendMessage(m);			
	}
	

	private void sendResizeAndMoveSlideMessage(ResizeAndMoveSlideMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("xOffset", msg.getxOffset());
		args.put("yOffest", msg.getyOffset());
		args.put("widthRatio", msg.getWidthRatio());
		args.put("heightRatio", msg.getHeightRatio());
		
		BroadcastClientMessage m = new BroadcastClientMessage(msg.getMeetingID(), "moveCallback", args);
		service.sendMessage(m);			
	}
}
