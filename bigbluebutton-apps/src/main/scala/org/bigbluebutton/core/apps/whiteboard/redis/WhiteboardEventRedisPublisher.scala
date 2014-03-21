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


import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.conference.service.messaging.MessagingConstants

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

class WhiteboardEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {
  	def handleMessage(msg: IOutMessage) {
	  msg match {
	    case msg: SendWhiteboardAnnotationEvent     => handleSendWhiteboardAnnotationEvent(msg)
	    //case msg: ClearWhiteboardEvent              => handleClearWhiteboardEvent(msg)
	    //case msg: UndoWhiteboardEvent               => handleUndoWhiteboardEvent(msg)
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
	  val gson = new Gson
	
	  System.out.println("^^^^I am in WhiteboardEventRedisPublisher.scala"
	      + "\n and msg=" + msg)
	      
	  val map= new java.util.HashMap[String, String]();
	  map.put("ANTON", "GE");
	  map.put("GE", "ANTO");
		
	  service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(map))   
	      
  		/*val map= new java.util.HashMap[String, String]();
		map.put("meetingID", msg.meetingID);
		map.put("messageID", MessagingConstants.USER_STATUS_CHANGE_EVENT);
			
		map.put("internalUserID", msg.userID);
		map.put("status", msg.status);
		map.put("value", msg.value.toString);
			
		val gson= new Gson();
		service.send(MessagingConstants.PARTICIPANTS_CHANNEL, gson.toJson(map));
		
		service.send(MessagingConstants.BIGBLUEBUTTON_WEBHOOK_EVENTS, gson.toJson(map));*/	
	  
	}
	
	/*private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
		val event = new ClearPageWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(System.currentTimeMillis())	
		event.setPresentation(getPresentationId(msg.whiteboardId))
		event.setPageNumber(getPageNum(msg.whiteboardId))
		event.setWhiteboardId(msg.whiteboardId)
		recorder.record(msg.meetingID, event)		
	}*/

	/*private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
		val event = new UndoShapeWhiteboardRecordEvent()
		event.setMeetingId(msg.meetingID)
		event.setTimestamp(System.currentTimeMillis())	
		event.setPresentation(getPresentationId(msg.whiteboardId))
		event.setPageNumber(getPageNum(msg.whiteboardId))
		event.setWhiteboardId(msg.whiteboardId)
		event.setShapeId(msg.shapeId);
		recorder.record(msg.meetingID, event)		
	}*/

}