package org.bigbluebutton.deskshare.server.sessions

import scala.actors.Actor
import scala.actors.Actor._
import net.lag.logging.Logger

import scala.collection.mutable.HashMap
import org.bigbluebutton.deskshare.server.svc1.Dimension
import org.bigbluebutton.deskshare.server.stream.StreamManager
import java.awt.Point

case class CreateSession(room: String, screenDim: Dimension, blockDim: Dimension)
case class RemoveSession(room: String)
case class SendKeyFrame(room: String)
case class UpdateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean)
case class UpdateMouseLocation(room: String, mouseLoc:Point)

class SessionManagerSVC(streamManager: StreamManager) extends Actor {
	private val log = Logger.get 
 
 	private val sessions = new HashMap[String, SessionSVC]
 	  
	def act() = {
	  loop {
	    react {
	      case c: CreateSession => createSession(c); printMailbox("CreateSession") 
	      case r: RemoveSession => removeSession(r.room); printMailbox("RemoveSession")
	      case k: SendKeyFrame => sendKeyFrame(k.room); printMailbox("SendKeyFrame")
	      case ub: UpdateBlock => updateBlock(ub.room, ub.position, ub.blockData, ub.keyframe)
	      case ml: UpdateMouseLocation => updateMouseLocation(ml.room, ml.mouseLoc)
	      case m: Any => log.warning("SessionManager: Unknown message " + m); printMailbox("Any")
	    }
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
			  val session: SessionSVC = new SessionSVC(this, c.room, c.screenDim, c.blockDim, streamManager) 
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

	private def removeSession(room: String): Unit = {
		log.debug("SessionManager: Removing session " + room);
    	sessions.get(room) match {
    	  case Some(s) => {
	    	    s ! StopSession; log.debug("++++ REMOVE SESSION +++%s", room);
	            val old:Int = sessions.size
	            sessions -= room; 
	            log.debug("RemoveSession: Session length [%d,%d]", old, sessions.size)
            }
    	  case None => log.warning("SessionManager: Could not remove session %s. Does not exist.", room)
    	}
	}
	
	private def updateMouseLocation(room: String, mouseLoc: Point): Unit = {
		sessions.get(room) match {
		  case Some(s) => s ! new UpdateSessionMouseLocation(mouseLoc)
		  case None => log.warning("SessionManager: Could not update mouse loc for session %s. Does not exist.", room)
		}
	}
	
	private def updateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean): Unit = {
		sessions.get(room) match {
		  case Some(s) => s ! new UpdateSessionBlock(position, blockData, keyframe)
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
