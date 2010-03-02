package org.bigbluebutton.deskshare.server.stream

import org.bigbluebutton.deskshare.server.sessions.SessionManagerGateway
import org.red5.server.api.Red5
import java.util.HashMap

class DeskshareService(streamManager: StreamManager, sessionGateway: SessionManagerGateway) {
	def checkIfStreamIsPublishing(): HashMap[String, Any] = {
		val room: String = Red5.getConnectionLocal().getScope().getName();
		println("Checking if " + room + " is streaming.")
		var publishing = false
		var width = 0
		var height = 0
  
		streamManager !? (3000, IsStreamPublishing(room)) match {
		  	case None => println("Timeout waiting for reply to IsStreamPublishing")
		  	case Some(rep) => {
		  		val reply = rep.asInstanceOf[StreamPublishingReply]
		  		publishing = reply.publishing
		  		width = reply.width
		  		height = reply.height
		  	}
		}
  
		
  
		val stream = new HashMap[String, Any]()
		stream.put("publishing", publishing)
		stream.put("width", width)
		stream.put("height", height)
  
		return stream;
	}
	
	def startedToViewStream(): Unit = {
		val room: String = Red5.getConnectionLocal().getScope().getName();
		println("Started viewing stream for room " + room)
		sessionGateway.sendKeyFrame(room)
	}
 
	def getVideoWidth(): Int = {
		val room: String = Red5.getConnectionLocal().getScope().getName();
		println("Checking if " + room + " is streaming.")
		var publishing = false
		var width = 0
		var height = 0
  
		streamManager !? IsStreamPublishing(room) match {
			case rep: StreamPublishingReply => {
			  publishing = rep.publishing
			  width = rep.width
			  height = rep.height
			} 
		}
		val stream = new HashMap[String, Any]()
		stream.put("publishing", publishing)
		stream.put("width", width)
		stream.put("height", height)
		return width;
	}
	
	def getVideoHeight(): Int = {
		val room: String = Red5.getConnectionLocal().getScope().getName();
		println("Checking if " + room + " is streaming.")
		var publishing = false
		var width = 0
		var height = 0
  
		streamManager !? IsStreamPublishing(room) match {
			case rep: StreamPublishingReply => {
			  publishing = rep.publishing
			  width = rep.width
			  height = rep.height
			} 
		}
		val stream = new HashMap[String, Any]()
		stream.put("publishing", publishing)
		stream.put("width", width)
		stream.put("height", height)
		return height;
	}
}
