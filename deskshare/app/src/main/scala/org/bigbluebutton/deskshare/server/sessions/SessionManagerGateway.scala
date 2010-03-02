package org.bigbluebutton.deskshare.server.sessions

import org.bigbluebutton.deskshare.common.Dimension
import org.bigbluebutton.deskshare.server.svc1.Dimension
import org.bigbluebutton.deskshare.server.stream.StreamManager
import org.bigbluebutton.deskshare.server.session.ISessionManagerGateway

import net.lag.configgy.Configgy
import net.lag.logging.Logger
//import java.util.logging.Logger

class SessionManagerGateway(streamManager: StreamManager) extends ISessionManagerGateway {  
	// load our config file and configure logfiles:
	Configgy.configure("/etc/bigbluebutton/deskshare.conf")
	
	private val log = Logger.get 
	log.warning("CAN'T GET Configuration" )
	streamManager.start
	val sessionManager: SessionManagerSVC = new SessionManagerSVC(streamManager)
    sessionManager.start 
  
	def createSession(room: String, screenDim: common.Dimension, blockDim: common.Dimension): Unit = {
		sessionManager ! new CreateSession(room, new svc1.Dimension(screenDim.getWidth(), screenDim.getHeight()), 
                                                              new svc1.Dimension(blockDim.getWidth(), blockDim.getHeight()))
	}

	def removeSession(room: String): Unit = {
		sessionManager ! new RemoveSession(room)
	}
	
	def updateBlock(room : String, position : Int, blockData : Array[Byte], keyframe : Boolean): Unit = {
		sessionManager ! new UpdateBlock(room, position, blockData, keyframe)
	}
}
