package org.bigbluebutton.deskshare.server.sessions

import scala.actors.Actor
import scala.actors.Actor._

import java.util.concurrent.ConcurrentHashMap
import org.bigbluebutton.deskshare.server.svc1.Dimension
import org.bigbluebutton.deskshare.server.stream.StreamManager

case class CreateSession(room: String, screenDim: Dimension, blockDim: Dimension)
case class RemoveSession(room: String)
case class SendKeyFrame(room: String)
case class UpdateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean)

class SessionManagerSVC(streamManager: StreamManager) extends Actor {

	private val sessions = new ConcurrentHashMap[String, SessionSVC]()
 	
	def act() = {
	  loop {
	    react {
	      case c: CreateSession => createSession(c) 
	      case r: RemoveSession => removeSession(r.room)
	      case k : SendKeyFrame => sendKeyFrame(k.room)
	      case ub: UpdateBlock => updateBlock(ub.room, ub.position, ub.blockData, ub.keyframe)
	      case m:Any => println("Unknown SessionManager message " + m)
	    }
	  }
	}
 
	private def sendKeyFrame(room: String) {
		println("Request to send key frame for room " + room);
		val session: SessionSVC = sessions.get(room);
  		if (session != null) session ! GenerateKeyFrame	  
	}
 
	private def createSession(c: CreateSession): Unit = {
		if (! sessions.containsKey(c.room)) {
			println("Created session " + c.room)
			val session: SessionSVC = new SessionSVC(c.room, c.screenDim, c.blockDim, streamManager) 
			if (sessions.putIfAbsent(c.room, session) == null) {
				// Successfully inserted session. I.e. no previous session.
				session.start
				session ! Initialize
			}
		} else {
			println("Session already exist for " + c.room)
		}
	}

	private def removeSession(room: String): Unit = {
//		println("Removing session " + room);
		val session: SessionSVC = sessions.remove(room);
  		if (session != null) {
  		  session ! StopSession
  		} else {
  		  println("Remove: Session " + room + " not found.")
  		}
    
	}
	
	private def updateBlock(room: String, position: Int, blockData: Array[Byte], keyframe: Boolean): Unit = {
		val session: SessionSVC = sessions.get(room);
		if (session != null) {
//			println("Sending update session block")
			session ! new UpdateSessionBlock(position, blockData, keyframe)
		}
			
	}
		
	
}
