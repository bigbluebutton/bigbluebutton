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

	private void recordEvent(HashMap<String, String> message) {
		recorder.record(session, message);
	}

	@Override
	public String getName() {
		return APP_NAME;
	}

	@SuppressWarnings("rawtypes")
	@Override
	public void sendUpdateMessage(Map message) {
    	String presentationName = (String) message.get("presentationName");
    	String messageKey = (String) message.get("messageKey");
    	
    	HashMap<String,String> map = new HashMap<String, String>();
    	map.put("timestamp", Long.toString(System.currentTimeMillis()));
    	map.put("presentationName", presentationName);
    	
		if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
			log.debug("{}[{}]",messageKey,presentationName);
			map.put("event", "generated_slide");
			map.put("numberOfPages", message.get("numberOfPages").toString());
			map.put("pagesCompleted", message.get("pagesCompleted").toString());
		}
		else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
			log.debug("{}[{}]",messageKey,presentationName);
			map.put("event", "generated_slide");
			map.put("slidesInfo", message.get("slidesInfo").toString());
		}
		else{
			log.error("NOT recording received message {}",messageKey);
		}
		
		recordEvent(map);
	}

	@SuppressWarnings("rawtypes")
	@Override
	public void assignPresenter(ArrayList presenter) {
		log.debug("RECORD module:presentation event:assign_presenter");
		HashMap<String, String> map= new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "presentation");
		map.put("event", "assign_presenter");
		map.put("userid", presenter.get(0).toString());
		map.put("name", presenter.get(1).toString());
		map.put("assignedBy", presenter.get(2).toString());
		
		recordEvent(map);
	}

	@Override
	public void gotoSlide(int curslide) {
		log.debug("RECORD module:presentation event:update_slide");
		HashMap<String, String> map= new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "presentation");
		map.put("event", "update_slide");
		map.put("slide", Integer.toString(curslide));
		
		recordEvent(map);
	}

	@Override
	public void resizeAndMoveSlide(Double xOffset, Double yOffset,
			Double widthRatio, Double heightRatio) {
		log.debug("RECORD module:presentation event:resize_move_slide");
		HashMap<String, String> map= new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "presentation");
		map.put("event", "resize_move_slide");
		map.put("xOffset", Double.toString(xOffset));
		map.put("yOffset", Double.toString(yOffset));
		map.put("widthRatio", Double.toString(widthRatio));
		map.put("heightRatio", Double.toString(heightRatio));
		
		recordEvent(map);
	}

	@Override
	public void removePresentation(String name) {
		log.debug("RECORD module:presentation event:remove_presentation");
		HashMap<String, String> map= new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "presentation");
		map.put("event", "remove_presentation");
		map.put("presentationName", name);
		
		recordEvent(map);
	}

	@Override
	public void sharePresentation(String presentationName, Boolean share) {
		log.debug("RECORD module:presentation event:share_presentation");
		HashMap<String, String> map= new HashMap<String, String>();
		map.put("timestamp", Long.toString(System.currentTimeMillis()));
		map.put("module", "presentation");
		map.put("event", "share_presentation");
		map.put("presentationName", presentationName);
		map.put("share", share.toString());
		
		recordEvent(map);
	}

}
