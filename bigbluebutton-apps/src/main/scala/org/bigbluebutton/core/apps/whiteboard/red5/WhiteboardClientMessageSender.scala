package org.bigbluebutton.core.apps.whiteboard.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import scala.collection.JavaConversions._
import com.google.gson.Gson
import java.util.ArrayList

class WhiteboardClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: GetWhiteboardShapesReply             => handleGetWhiteboardShapesReply(msg)
      case msg: SendWhiteboardAnnotationEvent        => handleSendWhiteboardAnnotationEvent(msg)
      case msg: ClearWhiteboardEvent                 => handleClearWhiteboardEvent(msg)
      case msg: UndoWhiteboardEvent                  => handleUndoWhiteboardEvent(msg)
      case msg: WhiteboardEnabledEvent               => handleWhiteboardEnabledEvent(msg)
      case msg: IsWhiteboardEnabledReply             => handleIsWhiteboardEnabledReply(msg)
      case _ => // do nothing
    }
  }
	
  private def handleWhiteboardEnabledEvent(msg: WhiteboardEnabledEvent) {
	val args = new java.util.HashMap[String, Object]()
	args.put("enabled", msg.enable:java.lang.Boolean)
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
//	println("WhiteboardClientMessageSender - handleWhiteboardEnabledEvent \n" + message.get("msg") + "\n")	
	
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardEnableWhiteboardCommand", message)
	service.sendMessage(m)
  }
	
  private def handleIsWhiteboardEnabledReply(msg: IsWhiteboardEnabledReply) {
	val args = new java.util.HashMap[String, Object]()
	args.put("enabled", msg.enabled:java.lang.Boolean)
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
//	println("WhiteboardClientMessageSender - handleIsWhiteboardEnabledReply \n" + message.get("msg") + "\n")		
	
	val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "WhiteboardIsWhiteboardEnabledReply", message)
	service.sendMessage(m)
  }
	
  private def handleGetWhiteboardShapesReply(msg: GetWhiteboardShapesReply) {
	val args = new java.util.HashMap[String, Object]()			
	args.put("count", msg.shapes.length:java.lang.Integer)
	args.put("whiteboardId", msg.whiteboardId)
	
	val annotations = new ArrayList[java.util.HashMap[String, Object]]
	msg.shapes.foreach {shape =>
	   val annotation = new java.util.HashMap[String, Object]();
	   annotation.put("id", shape.id)
	   annotation.put("status", shape.status)
	   annotation.put("type", shape.shapeType)      
	   annotation.put("shapes", mapAsJavaMap(shape.shape))
	
	  annotations.add(annotation);	   
    }
	
	args.put("annotations", annotations)
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
//	println("WhiteboardClientMessageSender - handleSendWhiteboardAnnotationHistoryReply \n" + message.get("msg") + "\n")	
	
	val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "WhiteboardRequestAnnotationHistoryReply", message)
	service.sendMessage(m)
  }
	
  private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {	
    val args = new java.util.HashMap[String, Object]()		
	args.put("whiteboardId", msg.whiteboardId)
	
	val shape = new java.util.HashMap[String, Object]()
	shape.put("id", msg.shape.id)
	shape.put("type", msg.shape.shapeType)
	shape.put("status", msg.shape.status)
	shape.put("shape", mapAsJavaMap(msg.shape.shape))
	
	args.put("shape", shape)
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
//	println("WhiteboardClientMessageSender - handleSendWhiteboardAnnotationEvent \n" + message.get("msg") + "\n")
	
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardNewAnnotationCommand", message)
	service.sendMessage(m)
  }
		
  private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
    val args = new java.util.HashMap[String, Object]()		
	args.put("whiteboardId", msg.whiteboardId)
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
//	println("WhiteboardClientMessageSender - handleClearWhiteboardEvent \n" + message.get("msg") + "\n")
		
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardClearCommand", message);
	service.sendMessage(m);	
  }
	
  private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
    val args = new java.util.HashMap[String, Object]()		
	args.put("whiteboardId", msg.whiteboardId)
	args.put("shapeId", msg.shapeId)
	
	val message = new java.util.HashMap[String, Object]() 
	val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	
//	println("WhiteboardClientMessageSender - handleUndoWhiteboardEvent \n" + message.get("msg") + "\n")
		
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardUndoCommand", message);
	service.sendMessage(m);
  }
}