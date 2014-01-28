package org.bigbluebutton.core.apps.whiteboard.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api.OutMessageListener2
import org.bigbluebutton.core.api.IOutMessage
import org.bigbluebutton.core.apps.whiteboard.messages._
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import scala.collection.JavaConversions._

class WhiteboardClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
  def handleMessage(msg: IOutMessage) {
    msg match {
      case sendWhiteboardAnnotationHistoryReply: SendWhiteboardAnnotationHistoryReply => handleSendWhiteboardAnnotationHistoryReply(sendWhiteboardAnnotationHistoryReply)
      case sendWhiteboardAnnotationEvent: SendWhiteboardAnnotationEvent => handleSendWhiteboardAnnotationEvent(sendWhiteboardAnnotationEvent)
      case changeWhiteboardPageEvent: ChangeWhiteboardPageEvent => handleChangeWhiteboardPageEvent(changeWhiteboardPageEvent)
      case clearWhiteboardEvent: ClearWhiteboardEvent => handleClearWhiteboardEvent(clearWhiteboardEvent)
      case undoWhiteboardEvent: UndoWhiteboardEvent => handleUndoWhiteboardEvent(undoWhiteboardEvent)
      case whiteboardActivePresentationEvent: WhiteboardActivePresentationEvent => handleWhiteboardActivePresentationEvent(whiteboardActivePresentationEvent)
      case whiteboardEnabledEvent: WhiteboardEnabledEvent => handleWhiteboardEnabledEvent(whiteboardEnabledEvent)
      case isWhiteboardEnabledReply: IsWhiteboardEnabledReply => handleIsWhiteboardEnabledReply(isWhiteboardEnabledReply)
      case _ => // do nothing
    }
  }

  private def handleWhiteboardActivePresentationEvent(msg: WhiteboardActivePresentationEvent) {
	val message = new java.util.HashMap[String, Object]()
	message.put("presentationID", msg.presentationID)
	message.put("numberOfPages", msg.numPages:java.lang.Integer)
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardChangePresentationCommand", message)
	service.sendMessage(m)
  }
	
  private def handleWhiteboardEnabledEvent(msg: WhiteboardEnabledEvent) {
	val message = new java.util.HashMap[String, Object]()
	message.put("enabled", msg.enable:java.lang.Boolean)
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardEnableWhiteboardCommand", message)
	service.sendMessage(m)
  }
	
  private def handleIsWhiteboardEnabledReply(msg: IsWhiteboardEnabledReply) {
	val message = new java.util.HashMap[String, Object]()
	message.put("enabled", msg.enabled:java.lang.Boolean)
	val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "WhiteboardIsWhiteboardEnabledReply", message)
	service.sendMessage(m)
  }
	
  private def handleSendWhiteboardAnnotationHistoryReply(msg: SendWhiteboardAnnotationHistoryReply) {
	val message = new java.util.HashMap[String, Object]()	
		
	message.put("count", msg.shapes.length:java.lang.Integer)
	message.put("presentationID", msg.presentationID)
	message.put("pageNumber", msg.numPages:java.lang.Integer)
	message.put("annotations", msg.shapes)
		
	val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "WhiteboardRequestAnnotationHistoryReply", message)
	service.sendMessage(m)
  }
	
  private def handleSendWhiteboardAnnotationEvent(msg: SendWhiteboardAnnotationEvent) {	  
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardNewAnnotationCommand", mapAsJavaMap(msg.shape.shape))
	service.sendMessage(m)
  }
	
  private def handleChangeWhiteboardPageEvent(msg: ChangeWhiteboardPageEvent) {
	val message = new java.util.HashMap[String, Object]()		
	message.put("pageNum", msg.page:java.lang.Integer)
	message.put("numAnnotations", msg.numAnnotations:java.lang.Integer)
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardChangePageCommand", message)
	service.sendMessage(m)
  }
	
  private def handleClearWhiteboardEvent(msg: ClearWhiteboardEvent) {
	val message = new java.util.HashMap[String, Object]()		
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardClearCommand", message);
	service.sendMessage(m);	
  }
	
  private def handleUndoWhiteboardEvent(msg: UndoWhiteboardEvent) {
	val message = new java.util.HashMap[String, Object]()		
	val m = new BroadcastClientMessage(msg.meetingID, "WhiteboardUndoCommand", message);
	service.sendMessage(m);
  }
}