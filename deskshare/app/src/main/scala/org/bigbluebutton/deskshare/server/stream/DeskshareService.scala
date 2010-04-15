package org.bigbluebutton.deskshare.server.stream

import org.bigbluebutton.deskshare.server.sessions.SessionManagerGateway
import org.red5.server.api.Red5
import java.util.HashMap
import net.lag.logging.Logger

class DeskshareService(streamManager: StreamManager, sessionGateway: SessionManagerGateway) {
	private val log = Logger.get
 
	def checkIfStreamIsPublishing(): HashMap[String, Any] = {
		val room: String = Red5.getConnectionLocal().getScope().getName();
		log.debug("Checking if %s is streaming.", room)
		var publishing = false
		var width = 0
		var height = 0
  
		streamManager !? (3000, IsStreamPublishing(room)) match {
		  	case None => log.warning("Timeout waiting for reply to IsStreamPublishing for room %s", room)
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
		log.debug("Started viewing stream for room %s", room)
		sessionGateway.sendKeyFrame(room)
	}
}
