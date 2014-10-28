/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.deskshare.server.sessions

import org.bigbluebutton.deskshare.server.svc1.Dimension
import org.bigbluebutton.deskshare.server.stream.StreamManager
import org.bigbluebutton.deskshare.server.session.ISessionManagerGateway
import java.awt.Point
import net.lag.logging.Logger

class SessionManagerGateway(streamManager: StreamManager, keyFrameInterval: Int, interframeInterval: Int, waitForAllBlocks: Boolean) extends ISessionManagerGateway {  
	
	private val log = Logger.get 

	streamManager.start
	val sessionManager: SessionManagerSVC = new SessionManagerSVC(streamManager, keyFrameInterval, interframeInterval, waitForAllBlocks)
  sessionManager.start 
  
	def createSession(room: String, screenDim: org.bigbluebutton.deskshare.common.Dimension, blockDim: org.bigbluebutton.deskshare.common.Dimension, seqNum: Int, useSVC2: Boolean): Unit = {
		log.info("SessionManagerGateway:createSession for %s", room)
		sessionManager ! new CreateSession(room, new Dimension(screenDim.getWidth(), screenDim.getHeight()), 
	                                       new Dimension(blockDim.getWidth(), blockDim.getHeight()), seqNum, useSVC2)
		log.info("SessionManagerGateway:Sent create session for %s", room)	    
	}

	def removeSession(room: String, seqNum: Int): Unit = {
	  log.info("SessionManagerGateway:removeSession for %s", room)
	  sessionManager ! new RemoveSession(room)
	}
	
	def updateBlock(room : String, position : Int, blockData : Array[Byte], keyframe : Boolean, seqNum: Int): Unit = {
		sessionManager ! new UpdateBlock(room, position, blockData, keyframe, seqNum)
	}
 
	def updateMouseLocation(room: String, mouseLoc: Point, seqNum: Int): Unit = {
	    sessionManager ! new UpdateMouseLocation(room, mouseLoc, seqNum)
	}
 
	def sendKeyFrame(room: String) {
	  log.info("SessionManagerGateway:sendKeyFrame for %s", room)
	  sessionManager ! new SendKeyFrame(room)
	}
	
	def stopSharingDesktop(meetingId: String, stream: String) {
	  sessionManager ! new StopSharingDesktop(meetingId, stream)
	}
	
	def isSharingStopped(meetingId: String): Boolean = {
	  var stopped = false
	  sessionManager !? (3000, IsSharingStopped(meetingId)) match {
		  	case None => stopped = true
		  	case Some(rep) => {
		  		val reply = rep.asInstanceOf[IsSharingStoppedReply]
		  		stopped = reply.stopped
		  	}
		}
	  
	  stopped
	}
	
}
