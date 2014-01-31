package org.bigbluebutton.core.apps.whiteboard.redis

import org.bigbluebutton.conference.service.recorder.RecorderApplication
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.whiteboard.redis.AddShapeWhiteboardRecordEvent
import scala.collection.JavaConversions._
import org.bigbluebutton.conference.service.whiteboard.WhiteboardKeyUtil
import org.bigbluebutton.conference.service.whiteboard.redis.AddTextWhiteboardRecordEvent
import org.bigbluebutton.conference.service.whiteboard.redis.ClearPageWhiteboardRecordEvent
import org.bigbluebutton.conference.service.whiteboard.redis.UndoShapeWhiteboardRecordEvent
import org.bigbluebutton.conference.service.whiteboard.redis.ModifyTextWhiteboardRecordEvent

class WhiteboardEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case sendWhiteboardAnnotationEvent: SendWhiteboardAnnotationEvent => handleSendWhiteboardAnnotationEvent(sendWhiteboardAnnotationEvent)
	    case clearWhiteboardEvent: ClearWhiteboardEvent => handleClearWhiteboardEvent(clearWhiteboardEvent)
	    case undoWhiteboardEvent: UndoWhiteboardEvent => handleUndoWhiteboardEvent(undoWhiteboardEvent)
	    case _ => //println("Unhandled message in UsersClientMessageSender")
	  }
	}
  	
	private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {
	  if ((msg.shape.shapeType == WhiteboardKeyUtil.TEXT_TYPE) && (msg.shape.status != WhiteboardKeyUtil.TEXT_CREATED_STATUS)) {
		val event = new ModifyTextWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(System.currentTimeMillis())
		event.setPresentation(msg.presentationID)
		event.setPageNumber(msg.page)
		event.addAnnotation(mapAsJavaMap(msg.shape.shape))
		recorder.record(msg.meetingID, event)	    
	  } else {
		val event = new AddShapeWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(System.currentTimeMillis())
		event.setPresentation(msg.presentationID)
		event.setPageNumber(msg.page)
		event.addAnnotation(mapAsJavaMap(msg.shape.shape))
		recorder.record(msg.meetingID, event)
	  }

	}
	
	private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
		val event = new ClearPageWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(System.currentTimeMillis())		
		event.setPresentation(msg.presentationID)
		event.setPageNumber(msg.page)
		recorder.record(msg.meetingID, event)		
	}

	private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
		val event = new UndoShapeWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(System.currentTimeMillis());		
		event.setPresentation(msg.presentationID);
		event.setPageNumber(msg.page);
		
		recorder.record(msg.meetingID, event);			
	}

}