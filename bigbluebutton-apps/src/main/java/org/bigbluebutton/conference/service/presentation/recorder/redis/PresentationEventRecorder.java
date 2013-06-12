package org.bigbluebutton.conference.service.presentation.recorder.redis;

import java.util.Map;
import org.bigbluebutton.conference.meeting.messaging.OutMessage;
import org.bigbluebutton.conference.meeting.messaging.OutMessageListener;
import org.bigbluebutton.conference.service.presentation.messaging.messages.ConversionUpdateMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.GotoSlideMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.PresentationCursorUpdateMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.RemovePresentationMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.ResizeAndMoveSlideMessage;
import org.bigbluebutton.conference.service.presentation.messaging.messages.SharePresentationMessage;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.presentation.ConversionCompletedPresentationRecordEvent;
import org.bigbluebutton.conference.service.recorder.presentation.CursorUpdateRecordEvent;
import org.bigbluebutton.conference.service.recorder.presentation.GenerateSlidePresentationRecordEvent;
import org.bigbluebutton.conference.service.recorder.presentation.GotoSlidePresentationRecordEvent;
import org.bigbluebutton.conference.service.recorder.presentation.RemovePresentationPresentationRecordEvent;
import org.bigbluebutton.conference.service.recorder.presentation.ResizeAndMoveSlidePresentationRecordEvent;
import org.bigbluebutton.conference.service.recorder.presentation.SharePresentationPresentationRecordEvent;

public class PresentationEventRecorder implements OutMessageListener {
	private static final String GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
	private static final String CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
	
	private RecorderApplication recorder;

	public void setRecorderApplication(RecorderApplication recorder) {
		this.recorder = recorder;
	}
	
	@Override
	public void send(OutMessage msg) {
		if (msg instanceof ConversionUpdateMessage) {
			sendUpdateMessage((ConversionUpdateMessage) msg);
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
	
	private void sendUpdateMessage(ConversionUpdateMessage msg){
		if (msg.isRecorded()) {
			Map<String, Object> message = msg.getMessage();
	    	String messageKey = (String) message.get("messageKey");

			if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
				GenerateSlidePresentationRecordEvent event = new GenerateSlidePresentationRecordEvent();
				event.setMeetingId(msg.getMeetingID());
				event.setTimestamp(System.currentTimeMillis());
				event.setPresentationName((String)message.get("presentationName"));
				event.setNumberOfPages((Integer)message.get("numberOfPages"));
				event.setPagesCompleted((Integer)message.get("pagesCompleted"));
				recorder.record(msg.getMeetingID(), event);
			}
			else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
				ConversionCompletedPresentationRecordEvent event = new ConversionCompletedPresentationRecordEvent();
				event.setMeetingId(msg.getMeetingID());
				event.setTimestamp(System.currentTimeMillis());
				event.setPresentationName((String)message.get("presentationName"));
				event.setSlidesInfo((String)message.get("slidesInfo"));
				recorder.record(msg.getMeetingID(), event);
			}			
		}

	}
		
	private void sendGotoSlideMessage(GotoSlideMessage msg) {
		if (msg.isRecorded()) {
			GotoSlidePresentationRecordEvent event = new GotoSlidePresentationRecordEvent();
			event.setMeetingId(msg.getMeetingID());
			event.setTimestamp(System.currentTimeMillis());
			event.setSlide(msg.getNum());
			recorder.record(msg.getMeetingID(), event);			
		}
	}

	private void sendResizeAndMoveSlideMessage(ResizeAndMoveSlideMessage msg) {
		if (msg.isRecorded()) {
			ResizeAndMoveSlidePresentationRecordEvent event = new ResizeAndMoveSlidePresentationRecordEvent();
			event.setMeetingId(msg.getMeetingID());
			event.setTimestamp(System.currentTimeMillis());
			event.setXOffset(msg.getxOffset());
			event.setYOffset(msg.getyOffset());
			event.setWidthRatio(msg.getWidthRatio());
			event.setHeightRatio(msg.getHeightRatio());
			
			recorder.record(msg.getMeetingID(), event);			
		}
	}

	private void sendRemovePresentationMessage(RemovePresentationMessage msg) {
		if (msg.isRecorded()) {
			RemovePresentationPresentationRecordEvent event = new RemovePresentationPresentationRecordEvent();
			event.setMeetingId(msg.getMeetingID());
			event.setTimestamp(System.currentTimeMillis());
			event.setPresentationName(msg.getPresentationID());
			
			recorder.record(msg.getMeetingID(), event);			
		}
	}

	private void sendSharePresentationMessage(SharePresentationMessage msg) {
		if (msg.isRecorded()) {
			SharePresentationPresentationRecordEvent event = new SharePresentationPresentationRecordEvent();
			event.setMeetingId(msg.getMeetingID());
			event.setTimestamp(System.currentTimeMillis());
			event.setPresentationName(msg.getPresentationID());
			event.setShare(msg.getShare());
			recorder.record(msg.getMeetingID(), event);			
		}
	}

	private void sendPresentationCursorUpdateMessage(PresentationCursorUpdateMessage msg) {
		if (msg.isRecorded()) {
			CursorUpdateRecordEvent event = new CursorUpdateRecordEvent();
			event.setMeetingId(msg.getMeetingID());
			event.setTimestamp(System.currentTimeMillis());
			event.setXPercent(msg.getxPercent());
			event.setYPercent(msg.getyPercent());
			
			recorder.record(msg.getMeetingID(), event);	
		}
	}
}
