package org.bigbluebutton.deskshare.server.sessions

import org.bigbluebutton.deskshare.common.Dimension
import org.bigbluebutton.deskshare.server.svc1.Dimension
import org.bigbluebutton.deskshare.server.stream.StreamManager
import org.bigbluebutton.deskshare.server.session.ISessionManagerGateway
import java.awt.Point
import net.lag.logging.Logger

class SessionManagerGateway(streamManager: StreamManager) extends ISessionManagerGateway {  
	
	private val log = Logger.get 

	streamManager.start
	val sessionManager: SessionManagerSVC = new SessionManagerSVC(streamManager)
    sessionManager.start 
  
	def createSession(room: String, screenDim: common.Dimension, blockDim: common.Dimension): Unit = {
		log.info("SessionManagerGateway:createSession for %s", room)
		sessionManager ! new CreateSession(room, new svc1.Dimension(screenDim.getWidth(), screenDim.getHeight()), 
	                                       new svc1.Dimension(blockDim.getWidth(), blockDim.getHeight()))
		log.info("SessionManagerGateway:Sent create session for %s", room)	    
	}

	def removeSession(room: String): Unit = {
	  log.info("SessionManagerGateway:removeSession for %s", room)
	  sessionManager ! new RemoveSession(room)
	}
	
	def updateBlock(room : String, position : Int, blockData : Array[Byte], keyframe : Boolean): Unit = {
		sessionManager ! new UpdateBlock(room, position, blockData, keyframe)
	}
 
	def updateMouseLocation(room: String, mouseLoc: Point): Unit = {
	    sessionManager ! new UpdateMouseLocation(room, mouseLoc)
	}
 
	def sendKeyFrame(room: String) {
	  log.info("SessionManagerGateway:sendKeyFrame for %s", room)
	  sessionManager ! new SendKeyFrame(room)
	}
}
