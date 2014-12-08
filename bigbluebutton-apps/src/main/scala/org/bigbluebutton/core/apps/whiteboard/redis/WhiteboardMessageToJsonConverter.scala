package org.bigbluebutton.core.apps.whiteboard.redis

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.messaging.Util
import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO
import collection.JavaConverters._
import scala.collection.JavaConversions._

object WhiteboardMessageToJsonConverter {
  private def shapeToMap(shape: AnnotationVO):java.util.Map[String, Any] = {
    val res = new scala.collection.mutable.HashMap[String, Any]
    res += "id"        -> shape.id
    res += "status"    -> shape.status
    res += "shape_type" -> shape.shapeType
    res += "wb_id"     -> shape.wbId
            
    val shapeMap = new scala.collection.mutable.HashMap[String, Any]()
    for ((key, value) <- shape.shape) {
      shapeMap += key -> value
    }
    res += "shape" -> mapAsJavaMap(shapeMap)
      
    mapAsJavaMap(res)
  }
  
  def getWhiteboardShapesReplyToJson(msg: GetWhiteboardShapesReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.WHITEBOARD_ID, msg.whiteboardId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)

    val shapes = new java.util.ArrayList[java.util.Map[String, Any]]()
    msg.shapes.foreach {shape =>
      shapes.add(shapeToMap(shape))
    }

    payload.put(Constants.SHAPES, shapes)
    
    val header = Util.buildHeader(MessageNames.GET_WHITEBOARD_SHAPES_REPLY, msg.version, Some(msg.replyTo))
    Util.buildJson(header, payload)
  }
  
  def sendWhiteboardAnnotationEventToJson(msg: SendWhiteboardAnnotationEvent):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.WHITEBOARD_ID, msg.whiteboardId)
    payload.put(Constants.SHAPE, shapeToMap(msg.shape))
 
    val header = Util.buildHeader(MessageNames.SEND_WHITEBOARD_SHAPE, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def clearWhiteboardEventToJson(msg: ClearWhiteboardEvent):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.WHITEBOARD_ID, msg.whiteboardId)
 
    val header = Util.buildHeader(MessageNames.WHITEBOARD_CLEARED, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def undoWhiteboardEventToJson(msg: UndoWhiteboardEvent):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.WHITEBOARD_ID, msg.whiteboardId)
    payload.put(Constants.SHAPE_ID, msg.shapeId)
    
    val header = Util.buildHeader(MessageNames.UNDO_WHITEBOARD, msg.version, None)
    Util.buildJson(header, payload)
  }  
  
  def whiteboardEnabledEventToJson(msg: WhiteboardEnabledEvent):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.ENABLE, msg.enable)

    val header = Util.buildHeader(MessageNames.WHITEBOARD_ENABLED, msg.version, None)
    Util.buildJson(header, payload)
  }

  def isWhiteboardEnabledReplyToJson(msg: IsWhiteboardEnabledReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.ENABLE, msg.enabled)
 
    val header = Util.buildHeader(MessageNames.IS_WHITEBOARD_ENABLED_REPLY, msg.version, Some(msg.replyTo))
    Util.buildJson(header, payload)
  }  
}