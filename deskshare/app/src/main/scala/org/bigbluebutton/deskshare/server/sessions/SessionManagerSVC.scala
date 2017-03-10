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

import scala.actors.Actor
import scala.actors.Actor._
import net.lag.logging.Logger
import scala.collection.mutable.HashMap
import org.bigbluebutton.deskshare.server.svc1.Dimension
import org.bigbluebutton.deskshare.server.stream.StreamManager
import java.awt.Point
import java.io.{PrintWriter, StringWriter}

case class CreateSession(room: String, screenDim: Dimension, blockDim: Dimension, seqNum: Int, useSVC2: Boolean)
case class RemoveSession(room: String)
case class SendKeyFrame(room: String)
case class UpdateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean, seqNum: Int)
case class UpdateMouseLocation(room: String, mouseLoc:Point, seqNum: Int)
case class StopSharingDesktop(meetingId: String, stream: String)
case class IsSharingStopped(meetingId: String)
case class IsSharingStoppedReply(meetingId: String, stopped: Boolean)

class SessionManagerSVC(streamManager: StreamManager, keyFrameInterval: Int, interframeInterval: Int, waitForAllBlocks: Boolean) extends Actor {
	private val log = Logger.get 
 
 	private val sessions = new HashMap[String, SessionSVC]
 	private val stoppedSessions = new HashMap[String, String]
	
	override def exceptionHandler() = {
	  case e: Exception => {
	    val sw:StringWriter = new StringWriter()
	    sw.write("An exception has been thrown on SessionManagerSVC, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
	    e.printStackTrace(new PrintWriter(sw))
	    log.error(sw.toString())
	  }
	}

	def act() = {
	  loop {
	    react {
	      case msg: CreateSession => createSession(msg); printMailbox("CreateSession") 
	      case msg: RemoveSession => removeSession(msg.room); printMailbox("RemoveSession")
	      case msg: SendKeyFrame => sendKeyFrame(msg.room); printMailbox("SendKeyFrame")
	      case msg: UpdateBlock => updateBlock(msg.room, msg.position, msg.blockData, msg.keyframe, msg.seqNum)
	      case msg: UpdateMouseLocation => updateMouseLocation(msg.room, msg.mouseLoc, msg.seqNum)
	      case msg: StopSharingDesktop => handleStopSharingDesktop(msg)
	      case msg: IsSharingStopped   => handleIsSharingStopped(msg)
	      
	      case msg: Any => log.warning("SessionManager: Unknown message " + msg); printMailbox("Any")
	    }
	  }
	}
 
	private def handleStopSharingDesktop(msg: StopSharingDesktop) {
    sessions.get(msg.meetingId) foreach { s =>
      stoppedSessions += msg.meetingId -> msg.stream
    }	  
	}
	
	private def handleIsSharingStopped(msg: IsSharingStopped) {
	  stoppedSessions.get(msg.meetingId) match {
	    case Some(s) => reply(new IsSharingStoppedReply(msg.meetingId, true))
	    case None    => reply(new IsSharingStoppedReply(msg.meetingId, false))
	  }
	}
	
	private def printMailbox(caseMethod: String) {
	  log.debug("SessionManager: mailbox %d message %s", mailboxSize, caseMethod)
	}
 
	private def sendKeyFrame(room: String) {
		log.debug("SessionManager: Request to send key frame for room %s", room)  
        sessions.get(room) match {
          case Some(s) => s ! GenerateKeyFrame
          case None => log.warning("SessionManager: Could not find room %s", room)
        }
	}
 
	private def createSession(c: CreateSession): Unit = {
		log.debug("Creating session for %s", c.room)
		sessions.get(c.room) match {
		  case None => {
			  log.debug("SessionManager: Created session " + c.room)
			  val session: SessionSVC = new SessionSVC(this, c.room, c.screenDim, c.blockDim, streamManager, keyFrameInterval, interframeInterval, waitForAllBlocks, c.useSVC2) 
			  if (session.initMe()) {
				  val old:Int = sessions.size
				  sessions += c.room -> session
				  session.start			  
				  session ! StartSession
				  log.debug("CreateSession: Session length [%d,%d]", old, sessions.size)			    
			  } else {
			    log.error("SessionManager:Failed to create session for %s", c.room)
			  }

			}
		  case Some(s) => log.warning("SessionManager: Session already exist for %s", c.room)
		}
	}

	private def removeSession(meetingId: String): Unit = {
		log.debug("SessionManager: Removing session " + meetingId);
    	sessions.get(meetingId) foreach { s =>
	    	s ! StopSession; log.debug("++++ REMOVE SESSION +++%s", meetingId);
	      val old:Int = sessions.size
	      sessions -= meetingId; 
	      log.debug("RemoveSession: Session length [%d,%d]", old, sessions.size)
	      stoppedSessions.get(meetingId) foreach {ss =>
	        stoppedSessions -= meetingId  
	      }
    	}
	}
	
	private def updateMouseLocation(room: String, mouseLoc: Point, seqNum: Int): Unit = {
		sessions.get(room) match {
		  case Some(s) => s ! new UpdateSessionMouseLocation(mouseLoc, seqNum)
		  case None => log.warning("SessionManager: Could not update mouse loc for session %s. Does not exist.", room)
		}
	}
	
	private def updateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean, seqNum: Int): Unit = {
		sessions.get(room) match {
		  case Some(s) => s ! new UpdateSessionBlock(position, blockData, keyframe, seqNum)
		  case None => log.warning("SessionManager: Could not update session %s. Does not exist.", room)
		}
	}
		
	override def  exit() : Nothing = {
	  log.warning("SessionManager: **** Exiting Actor")
	  super.exit()
	}
 
	override def exit(reason : AnyRef) : Nothing = {
	  log.warning("SessionManager: **** Exiting SessionManager Actor %s", reason)
	  super.exit(reason)
	}
}
