package org.bigbluebutton.core.apps.whiteboard.redis

import org.bigbluebutton.core.api._
import scala.collection.JavaConversions._
import org.bigbluebutton.conference.service.whiteboard.WhiteboardKeyUtil
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
	      + "\n and msg=" + gson.toJson(msg))
		  
	  val header= new java.util.HashMap[String, Any]();
	  
	  val destination= new java.util.HashMap[String, String]();
	  destination.put("to","apps_channel")
	  
	  header.put("destination", destination)
	  header.put("name","whiteboard_draw_event")
	  header.put("timestamp","Fri, 21 Mar 2014 18:53:08 GMT")
	  header.put("source","bbb-apps")
	  
	  //PAYLOAD
	  val payload= new java.util.HashMap[String, Any]();
	  
	  val meeting= new java.util.HashMap[String, Any]();
	  meeting.put("id","183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1395072308944")
	  meeting.put("id", msg.meetingID)
	  payload.put("meeting",meeting)
	  
	  payload.put("session","someSessionId")
	  payload.put("whiteboard_id",msg.whiteboardId)
	  payload.put("shape_id","q779ogycfmxk-13-1383262166102")
	  payload.put("shape_type", msg.shape.shapeType) // this is how I should extract data from the msg
	  
	  val data= new java.util.HashMap[String, Any]();
	  
	  val coordinate= new java.util.HashMap[String, Any]();
	  coordinate.put("first_x", 0.016025641025641028)
	  coordinate.put("first_y", 0.982905982905983)
	  coordinate.put("last_x",0.33)
	  coordinate.put("last_y",0.45)
	  data.put("coordinate",coordinate)
	  
	  val line= new java.util.HashMap[String, Any]();
	  line.put("line_type", "solid")
	  line.put("color", 0)
	  data.put("line",line)
	  
	  data.put("weight", 18)
	  
	  val background= new java.util.HashMap[String, Any]();
	  background.put("visible", true)
	  background.put("color", 0)
	  background.put("alpha", 1)
	  data.put("background", background)
	  
	  data.put("square", false)
	  
	  payload.put("data", data)
	  
	  val by= new java.util.HashMap[String, Any]();
	  by.put("id", "user1")
	  by.put("name", "Guga")
	  payload.put("by", by)
	  
	  //High level
	  val map= new java.util.HashMap[String, Any]();
	  map.put("header",header)
	  map.put("payload",payload)
	  
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