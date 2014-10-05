package org.bigbluebutton.core.apps.presentation.redis

import org.bigbluebutton.conference.service.recorder.RecorderApplication
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
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
import org.bigbluebutton.core.api.PresentationConversionDone
import org.bigbluebutton.core.api.TimestampGenerator

class PresentationEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {
  private val GENERATED_SLIDE_KEY = "GENERATED_SLIDE";
  private val CONVERSION_COMPLETED_KEY = "CONVERSION_COMPLETED";
	
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: ClearPresentationOutMsg      => handleClearPresentationOutMsg(msg)
      case msg: RemovePresentationOutMsg     => handleRemovePresentationOutMsg(msg)
      case msg: SendCursorUpdateOutMsg       => handleSendCursorUpdateOutMsg(msg)
      case msg: ResizeAndMoveSlideOutMsg     => handleResizeAndMoveSlideOutMsg(msg)
      case msg: GotoSlideOutMsg              => handleGotoSlideOutMsg(msg)
      case msg: SharePresentationOutMsg      => handleSharePresentationOutMsg(msg)
      case _ => // do nothing
    }
  }
  
  private def handleClearPresentationOutMsg(msg: ClearPresentationOutMsg) {
    
  }
  
  
  private def handlePresentationConversionDone(msg: PresentationConversionDone) {	
    if (msg.recorded) {
	    val event = new ConversionCompletedPresentationRecordEvent();
	    event.setMeetingId(msg.meetingID);
	    event.setTimestamp(TimestampGenerator.generateTimestamp);
	    event.setPresentationName(msg.presentation.id);
	    event.setOriginalFilename(msg.presentation.name);
	    recorder.record(msg.meetingID, event);       
    }
    
  }
  		
  private def handleGotoSlideOutMsg(msg: GotoSlideOutMsg) {
	if (msg.recorded) {
    val event = new GotoSlidePresentationRecordEvent();
    event.setMeetingId(msg.meetingID);
	  event.setTimestamp(TimestampGenerator.generateTimestamp);
	  event.setSlide(msg.page.num);
	  event.setId(msg.page.id);
	  event.setNum(msg.page.num);
	  event.setThumbUri(msg.page.thumbUri);
	  event.setSwfUri(msg.page.swfUri);
	  event.setTxtUri(msg.page.txtUri);
	  event.setPngUri(msg.page.pngUri);
	  event.setXOffset(msg.page.xOffset);
	  event.setYOffset(msg.page.yOffset);
	  event.setWidthRatio(msg.page.widthRatio);
	  event.setHeightRatio(msg.page.heightRatio);
	  recorder.record(msg.meetingID, event);			
	}
  }

  private def handleResizeAndMoveSlideOutMsg(msg: ResizeAndMoveSlideOutMsg) {
	if (msg.recorded) {
		val event = new ResizeAndMoveSlidePresentationRecordEvent();
		event.setMeetingId(msg.meetingID);
		event.setTimestamp(TimestampGenerator.generateTimestamp);
		event.setId(msg.page.id);
		event.setNum(msg.page.num);
		event.setThumbUri(msg.page.thumbUri);
		event.setSwfUri(msg.page.swfUri);
		event.setTxtUri(msg.page.txtUri);
		event.setPngUri(msg.page.pngUri);
		event.setXOffset(msg.page.xOffset);
		event.setYOffset(msg.page.yOffset);
		event.setWidthRatio(msg.page.widthRatio);
		event.setHeightRatio(msg.page.heightRatio);
			
		recorder.record(msg.meetingID, event);			
	}
  }

  private def handleRemovePresentationOutMsg(msg: RemovePresentationOutMsg) {
	if (msg.recorded) {
	  val event = new RemovePresentationPresentationRecordEvent();
	  event.setMeetingId(msg.meetingID);
	  event.setTimestamp(TimestampGenerator.generateTimestamp);
	  event.setPresentationName(msg.presentationID);
      recorder.record(msg.meetingID, event);			
	}
  }

  private def handleSharePresentationOutMsg(msg: SharePresentationOutMsg) {
	if (msg.recorded) {
	  val event = new SharePresentationPresentationRecordEvent();
      event.setMeetingId(msg.meetingID);
      event.setTimestamp(TimestampGenerator.generateTimestamp);
      event.setPresentationName(msg.presentation.id);
      event.setOriginalFilename(msg.presentation.name);
	    event.setShare(true);
      recorder.record(msg.meetingID, event);			
    }
  }

  private def handleSendCursorUpdateOutMsg(msg: SendCursorUpdateOutMsg) {
	if (msg.recorded) {
		val event = new CursorUpdateRecordEvent();
		event.setMeetingId(msg.meetingID);
		event.setTimestamp(TimestampGenerator.generateTimestamp);
		event.setXPercent(msg.xPercent);
		event.setYPercent(msg.yPercent);
		
		recorder.record(msg.meetingID, event);	
	}
  }
}