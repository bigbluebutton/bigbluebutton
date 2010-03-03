package org.bigbluebutton.deskshare.server.sessions

import scala.actors.Actor
import scala.actors.Actor._
import net.lag.logging.Logger

import scala.collection.mutable.HashMap
import org.bigbluebutton.deskshare.server.svc1.Dimension
import org.bigbluebutton.deskshare.server.stream.StreamManager

case class CreateSession(room: String, screenDim: Dimension, blockDim: Dimension)
case class RemoveSession(room: String)
case class SendKeyFrame(room: String)
case class UpdateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean)

class SessionManagerSVC(streamManager: StreamManager) extends Actor {
	private val log = Logger.get 
 
 	private val sessions = new HashMap[String, SessionSVC]
  
	def act() = {
	  loop {
	    react {
	      case c: CreateSession => createSession(c) 
	      case r: RemoveSession => removeSession(r.room)
	      case k : SendKeyFrame => sendKeyFrame(k.room)
	      case ub: UpdateBlock => updateBlock(ub.room, ub.position, ub.blockData, ub.keyframe)
	      case m:Any => log.warning("Unknown SessionManager message " + m)
	    }
	  }
	}
 
	private def sendKeyFrame(room: String) {
		log.debug("Request to send key frame for room " + room)  
        sessions.get(room) match {
          case Some(s) => s ! GenerateKeyFrame
          case None => log.warning("Could not find room " + room)
        }
	}
 
	private def createSession(c: CreateSession): Unit = {
		if (! sessions.contains(c.room)) {
			log.debug("Created session " + c.room)
			val session: SessionSVC = new SessionSVC(c.room, c.screenDim, c.blockDim, streamManager) 
			sessions += c.room -> session
			session.start
			session ! StartSession
		} else {
			log.warning("Session already exist for " + c.room)
		}
	}

	private def removeSession(room: String): Unit = {
		log.debug("Removing session " + room);
    	sessions.get(room) match {
    	  case Some(s) => s ! StopSession
    	  case None => log.warning("Could not find room " + room)
    	}
    	sessions -= room
	}
	
	private def updateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean): Unit = {
		sessions.get(room) match {
		  case Some(s) => s ! new UpdateSessionBlock(position, blockData, keyframe)
		  case None => log.warning("Could not find room " + room)
		}
	}
		
	
}
