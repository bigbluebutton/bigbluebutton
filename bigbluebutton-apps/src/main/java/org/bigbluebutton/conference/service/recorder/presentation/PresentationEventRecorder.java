package org.bigbluebutton.conference.service.recorder.presentation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.presentation.IPresentationRoomListener;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class PresentationEventRecorder implements IPresentationRoomListener {
	private static Logger log = Red5LoggerFactory.getLogger( PresentationEventRecorder.class, "bigbluebutton" );	
	private static final String GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
	private static final String CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
	
	String APP_NAME = "RECORDER:PRESENTATION";
	private final RecorderApplication recorder;
	private final String session;
	
	public PresentationEventRecorder(String session, RecorderApplication recorder) {
		this.recorder = recorder;
		this.session = session;
	}

	@Override
	public String getName() {
		return APP_NAME;
	}

	@SuppressWarnings("rawtypes")
	@Override
	public void sendUpdateMessage(Map<String, Object> message) {
    	String messageKey = (String) message.get("messageKey");

		if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
			handleGeneratedSlideEvent(message);
		}
		else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
			handleConversionCompletedEvent(message);
		}
		else{
			log.error("NOT recording received message " + messageKey);
		}
	}
	
	private void handleGeneratedSlideEvent(Map<String, Object> message) {
		log.debug("Generated Slide Event [" + message.get("presentationName") + "]");
		
		GenerateSlidePresentationRecordEvent event = new GenerateSlidePresentationRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentationName((String)message.get("presentationName"));
		event.setNumberOfPages((Integer)message.get("numberOfPages"));
		event.setPagesCompleted((Integer)message.get("pagesCompleted"));
		recorder.record(session, event);
	}

	private void handleConversionCompletedEvent(Map<String, Object> message) {
		log.debug("Conversion Completed Event [" + message.get("presentationName") + "]");
		
		ConversionCompletedPresentationRecordEvent event = new ConversionCompletedPresentationRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentationName((String)message.get("presentationName"));
		event.setSlidesInfo((String)message.get("slidesInfo"));
		recorder.record(session, event);
	}
	
	@Override
	public void gotoSlide(int curslide) {
		log.debug("RECORD module:presentation event:update_slide");
		GotoSlidePresentationRecordEvent event = new GotoSlidePresentationRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setSlide(curslide);
		recorder.record(session, event);
	}

	@Override
	public void resizeAndMoveSlide(Double xOffset, Double yOffset, Double widthRatio, Double heightRatio) {
		log.debug("RECORD module:presentation event:resize_move_slide");

		ResizeAndMoveSlidePresentationRecordEvent event = new ResizeAndMoveSlidePresentationRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setXOffset(xOffset.doubleValue());
		event.setYOffset(yOffset.doubleValue());
		event.setWidthRatio(widthRatio.doubleValue());
		event.setHeightRatio(heightRatio.doubleValue());
		
		recorder.record(session, event);
	}

	@Override
	public void removePresentation(String name) {
		log.debug("RECORD module:presentation event:remove_presentation");		
		RemovePresentationPresentationRecordEvent event = new RemovePresentationPresentationRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentationName(name);
		
		recorder.record(session, event);
	}

	@Override
	public void sharePresentation(String presentationName, Boolean share) {
		log.debug("RECORD module:presentation event:share_presentation");		
		SharePresentationPresentationRecordEvent event = new SharePresentationPresentationRecordEvent();
		event.setMeetingId(session);
		event.setTimestamp(System.currentTimeMillis());
		event.setPresentationName(presentationName);
		event.setShare(share.booleanValue());
		recorder.record(session, event);
	}

}
