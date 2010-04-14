package org.bigbluebutton.deskshare.server.stream

import org.bigbluebutton.deskshare.server.red5.DeskshareApplication
import org.red5.server.api.IScope
import org.red5.server.api.so.ISharedObject

import java.util.ArrayList

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap

import net.lag.logging.Logger

case class IsStreamPublishing(room: String)
case class StreamPublishingReply(publishing: Boolean, width: Int, height: Int)

class StreamManager extends Actor {
	private val log = Logger.get
 
	var app: DeskshareApplication = null
 
	def setDeskshareApplication(a: DeskshareApplication) {
	  app = a
	}
	
  	private case class AddStream(room: String, stream: DeskshareStream)
  	private case class RemoveStream(room: String)

	private val streams = new HashMap[String, DeskshareStream]
 

	def act() = {
	  loop {
	    react {
	      case cs: AddStream => {
	    	  log.debug("Adding stream " + cs.room)
	    	  streams += cs.room -> cs.stream
	        }
	      case ds: RemoveStream => {
	    	  log.debug("Removing Stream " + ds.room)
	    	  streams -= ds.room
	      	}
	      case is: IsStreamPublishing => {
	    	  log.debug("Received IsStreamPublishing message for " + is.room)
	    	  streams.get(is.room) match {
	    	    case Some(str) =>  reply(new StreamPublishingReply(true, str.width, str.height))
	    	    case None => reply(new StreamPublishingReply(false, 0, 0))
	    	  }
	      	}
	      case m: Any => log.warning("StreamManager received unknown message: " + m)
	    }
	  }
	}
 
	def createStream(room: String, width: Int, height: Int): Stream = {	
  		val scope: IScope = app.getAppScope().getScope(room)	
  		val deskSO: ISharedObject  = app.getSharedObject(app.getAppScope().getScope(room), "deskSO")
		val stream = new DeskshareStream(scope, deskSO, room, width, height)
  		stream.start
		this ! new AddStream(room, stream)
		return stream
	}
 
  	def destroyStream(room: String) {
  		this ! new RemoveStream(room)
  	}  	
}
