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
	      case m:Any => log.warning("SessionManager: Unknown message " + m)
	    }
	  }
	}
 
	private def sendKeyFrame(room: String) {
		log.debug("SessionManager: Request to send key frame for room %s", room)  
        sessions.get(room) match {
          case Some(s) => s ! GenerateKeyFrame
          case None => log.warning("SessionManager: Could not find room %s", room)
        }
	}
 
	private def createSession(c: CreateSession): Unit = {
		if (! sessions.contains(c.room)) {
			log.debug("SessionManager: Created session " + c.room)
			val session: SessionSVC = new SessionSVC(this, c.room, c.screenDim, c.blockDim, streamManager) 
			sessions += c.room -> session
			session.start
			session ! StartSession
		} else {
			log.warning("SessionManager: Session already exist for %s", c.room)
		}
	}

	private def removeSession(room: String): Unit = {
		log.debug("SessionManager: Removing session " + room);
    	sessions.get(room) match {
    	  case Some(s) => s ! StopSession; sessions -= room
    	  case None => log.warning("SessionManager: Could not find room %s", room)
    	}
	}
	
	private def updateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean): Unit = {
		sessions.get(room) match {
		  case Some(s) => s ! new UpdateSessionBlock(position, blockData, keyframe)
		  case None => log.warning("SessionManager: Could not find room %s", room)
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
