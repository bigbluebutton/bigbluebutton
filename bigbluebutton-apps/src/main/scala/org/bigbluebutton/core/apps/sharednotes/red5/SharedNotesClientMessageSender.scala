package org.bigbluebutton.core.apps.sharednotes.red5

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage
import com.google.gson.Gson
import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage
import scala.collection.mutable.HashMap
import collection.JavaConverters._
import scala.collection.JavaConversions._
import java.util.ArrayList

class SharedNotesClientMessageSender(service: ConnectionInvokerService) extends OutMessageListener2 {
 
  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: PatchDocumentReply               => handlePatchDocumentReply(msg)
      case msg: GetCurrentDocumentReply          => handleGetCurrentDocumentReply(msg)
      case msg: CreateAdditionalNotesReply       => handleCreateAdditionalNotesReply(msg)
      case msg: DestroyAdditionalNotesReply      => handleDestroyAdditionalNotesReply(msg)
      case _ => // do nothing
    }
  }
  
  private def handlePatchDocumentReply(msg: PatchDocumentReply) {
    val message = new java.util.HashMap[String, Object]()
    message.put("userID", msg.requesterID)
    message.put("noteID", msg.noteID)
    message.put("patch", msg.patch)
    message.put("beginIndex", msg.beginIndex.toString)
    message.put("endIndex", msg.endIndex.toString)

    val m = new BroadcastClientMessage(msg.meetingID, "PatchDocumentCommand", message);
    service.sendMessage(m);
  }
  
  private def handleGetCurrentDocumentReply(msg: GetCurrentDocumentReply) {	
    val gson = new Gson();
    val message = new java.util.HashMap[String, Object]()

    val jsonMsg = gson.toJson(mapAsJavaMap(msg.notes))
  	
    message.put("notes", jsonMsg)
  	  
	  val m = new DirectClientMessage(msg.meetingID, msg.requesterID, "GetCurrentDocumentCommand", message);
	  service.sendMessage(m);
  }
  
  private def handleCreateAdditionalNotesReply(msg: CreateAdditionalNotesReply) {
    val message = new java.util.HashMap[String, Object]()
    message.put("noteID", msg.noteID)
    message.put("noteName", msg.noteName)

    val m = new BroadcastClientMessage(msg.meetingID, "CreateAdditionalNotesCommand", message);
    service.sendMessage(m);
  }
  
  private def handleDestroyAdditionalNotesReply(msg: DestroyAdditionalNotesReply) {
    val message = new java.util.HashMap[String, Object]()
    message.put("noteID", msg.noteID)

    val m = new BroadcastClientMessage(msg.meetingID, "DestroyAdditionalNotesCommand", message);
    service.sendMessage(m);
  }
}