package org.bigbluebutton.core.apps.presentation.redis

import org.bigbluebutton.conference.service.recorder.RecorderApplication
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.api.PresentationConversionUpdateOutMsg
import org.bigbluebutton.conference.service.recorder.presentation.GenerateSlidePresentationRecordEvent
import org.bigbluebutton.conference.service.recorder.presentation.ConversionCompletedPresentationRecordEvent
import org.bigbluebutton.core.api.GotoSlideOutMsg
import org.bigbluebutton.conference.service.recorder.presentation.GotoSlidePresentationRecordEvent
import org.bigbluebutton.core.api.ResizeAndMoveSlideOutMsg
import org.bigbluebutton.conference.service.recorder.presentation.ResizeAndMoveSlidePresentationRecordEvent
import org.bigbluebutton.core.api.RemovePresentationOutMsg
import org.bigbluebutton.conference.service.recorder.presentation.RemovePresentationPresentationRecordEvent
import org.bigbluebutton.core.api.SharePresentationOutMsg
import org.bigbluebutton.conference.service.recorder.presentation.SharePresentationPresentationRecordEvent
import org.bigbluebutton.core.api.SendCursorUpdateOutMsg
import org.bigbluebutton.conference.service.recorder.presentation.CursorUpdateRecordEvent
import org.bigbluebutton.core.api.ClearPresentationOutMsg

class PresentationEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {
  	private val GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
	private val CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
	
  def handleMessage(msg: IOutMessage) {
    msg match {
      case clearPresentationOutMsg: ClearPresentationOutMsg => handleClearPresentationOutMsg(clearPresentationOutMsg)
      case presentationConversionUpdateOutMsg: PresentationConversionUpdateOutMsg => handlePresentationConversionUpdateOutMsg(presentationConversionUpdateOutMsg)
      case removePresentationOutMsg: RemovePresentationOutMsg => handleRemovePresentationOutMsg(removePresentationOutMsg)
      case sendCursorUpdateOutMsg: SendCursorUpdateOutMsg => handleSendCursorUpdateOutMsg(sendCursorUpdateOutMsg)
      case resizeAndMoveSlideOutMsg: ResizeAndMoveSlideOutMsg => handleResizeAndMoveSlideOutMsg(resizeAndMoveSlideOutMsg)
      case gotoSlideOutMsg: GotoSlideOutMsg => handleGotoSlideOutMsg(gotoSlideOutMsg)
      case sharePresentationOutMsg: SharePresentationOutMsg => handleSharePresentationOutMsg(sharePresentationOutMsg)
      case _ => // do nothing
    }
  }
  
  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    
  }
  
  	private def handlePresentationConversionUpdateOutMsg(msg: PresentationConversionUpdateOutMsg) {
		if (msg.recorded) {
			val message = msg.msg;
	    	val messageKey = message.get("messageKey").asInstanceOf[String];

			if(messageKey.equalsIgnoreCase(GENERATED_SLIDE_KEY)){
				val event = new GenerateSlidePresentationRecordEvent();
				event.setMeetingId(msg.meetingID);
				event.setTimestamp(System.currentTimeMillis());
				event.setPresentationName(message.get("presentationName").asInstanceOf[String]);
				event.setNumberOfPages(message.get("numberOfPages").asInstanceOf[Int]);
				event.setPagesCompleted(message.get("pagesCompleted").asInstanceOf[Int]);
				recorder.record(msg.meetingID, event);
			}
			else if(messageKey.equalsIgnoreCase(CONVERSION_COMPLETED_KEY)){
				val event = new ConversionCompletedPresentationRecordEvent();
				event.setMeetingId(msg.meetingID);
				event.setTimestamp(System.currentTimeMillis());
				event.setPresentationName(message.get("presentationName").asInstanceOf[String]);
				event.setSlidesInfo(message.get("slidesInfo").asInstanceOf[String]);
				recorder.record(msg.meetingID, event);
			}			
		}
	}
		
	private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
		if (msg.recorded) {
			val event = new GotoSlidePresentationRecordEvent();
			event.setMeetingId(msg.meetingID);
			event.setTimestamp(System.currentTimeMillis());
			event.setSlide(msg.slide);
			recorder.record(msg.meetingID, event);			
		}
	}

	private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
		if (msg.recorded) {
			val event = new ResizeAndMoveSlidePresentationRecordEvent();
			event.setMeetingId(msg.meetingID);
			event.setTimestamp(System.currentTimeMillis());
			event.setXOffset(msg.xOffset);
			event.setYOffset(msg.yOffset);
			event.setWidthRatio(msg.widthRatio);
			event.setHeightRatio(msg.heightRatio);
			
			recorder.record(msg.meetingID, event);			
		}
	}

	private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
		if (msg.recorded) {
			val event = new RemovePresentationPresentationRecordEvent();
			event.setMeetingId(msg.meetingID);
			event.setTimestamp(System.currentTimeMillis());
			event.setPresentationName(msg.presentationID);
			
			recorder.record(msg.meetingID, event);			
		}
	}

	private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
		if (msg.recorded) {
			val event = new SharePresentationPresentationRecordEvent();
			event.setMeetingId(msg.meetingID);
			event.setTimestamp(System.currentTimeMillis());
			event.setPresentationName(msg.presentationID);
			event.setShare(msg.share);
			recorder.record(msg.meetingID, event);			
		}
	}

	private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
		if (msg.recorded) {
			val event = new CursorUpdateRecordEvent();
			event.setMeetingId(msg.meetingID);
			event.setTimestamp(System.currentTimeMillis());
			event.setXPercent(msg.xPercent);
			event.setYPercent(msg.yPercent);
			
			recorder.record(msg.meetingID, event);	
		}
	}
}