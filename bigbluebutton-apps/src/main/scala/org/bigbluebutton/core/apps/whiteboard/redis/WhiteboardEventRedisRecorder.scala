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
import scala.collection.immutable.StringOps


class WhiteboardEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {

  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: SendWhiteboardAnnotationEvent     => handleSendWhiteboardAnnotationEvent(msg)
	    case msg: ClearWhiteboardEvent              => handleClearWhiteboardEvent(msg)
	    case msg: UndoWhiteboardEvent               => handleUndoWhiteboardEvent(msg)
	    case _ => //println("Unhandled message in UsersClientMessageSender")
	  }
	}
  	
  	private def getPresentationId(whiteboardId:String):String = {
	  // Need to split the whiteboard id into presenation id and page num as the old
	  // recording expects them
	  val strId = new StringOps(whiteboardId)
	  val ids = strId.split('/')
	  var presId:String = ""	
	  if (ids.length == 2) {
	    presId = ids(0)
	  }
	  
	  presId
  	}

  	 private def getPageNum(whiteboardId:String):String = {
	  val strId = new StringOps(whiteboardId)
	  val ids = strId.split('/')
	  var pageNum = "0"
	  if (ids.length == 2) {
	    pageNum = ids(1)
	  }
	  pageNum
  	}
  	  	
	private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {		  
	  if ((msg.shape.shapeType == WhiteboardKeyUtil.TEXT_TYPE) && (msg.shape.status != WhiteboardKeyUtil.TEXT_CREATED_STATUS)) {
	    	    
		val event = new ModifyTextWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(TimestampGenerator.generateTimestamp)
		event.setPresentation(getPresentationId(msg.whiteboardId))
		event.setPageNumber(getPageNum(msg.whiteboardId))
		event.setWhiteboardId(msg.whiteboardId)
		event.addAnnotation(mapAsJavaMap(msg.shape.shape))
		recorder.record(msg.meetingID, event)	    
	  } else {
		val event = new AddShapeWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(TimestampGenerator.generateTimestamp)
		event.setPresentation(getPresentationId(msg.whiteboardId))
		event.setPageNumber(getPageNum(msg.whiteboardId))
		event.setWhiteboardId(msg.whiteboardId);
		event.addAnnotation(mapAsJavaMap(msg.shape.shape))
		recorder.record(msg.meetingID, event)
	  }
	}
	
	private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
		val event = new ClearPageWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(TimestampGenerator.generateTimestamp)	
		event.setPresentation(getPresentationId(msg.whiteboardId))
		event.setPageNumber(getPageNum(msg.whiteboardId))
		event.setWhiteboardId(msg.whiteboardId)
		recorder.record(msg.meetingID, event)		
	}

	private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
		val event = new UndoShapeWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(TimestampGenerator.generateTimestamp)	
		event.setPresentation(getPresentationId(msg.whiteboardId))
		event.setPageNumber(getPageNum(msg.whiteboardId))
		event.setWhiteboardId(msg.whiteboardId)
		event.setShapeId(msg.shapeId);
		recorder.record(msg.meetingID, event)		
	}

}