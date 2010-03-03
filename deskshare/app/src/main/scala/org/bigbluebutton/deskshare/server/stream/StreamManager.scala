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
 
	private val clientInvoker: ClientInvoker = new ClientInvoker()
	clientInvoker.start
 
	def act() = {
	  loop {
	    react {
	      case cs: AddStream => {
	    	  log.debug("Adding stream " + cs.room)
	    	  streams += cs.room -> cs.stream
	    	  clientInvoker ! new StreamStarted(cs.room)
	        }
	      case ds: RemoveStream => {
	    	  log.debug("Removing Stream " + ds.room)
	    	  streams -= ds.room
	    	  clientInvoker ! new StreamStopped(ds.room)
	      	}
	      case is: IsStreamPublishing => {
	    	  log.debug("Received IsStreamPublishing message for " + is.room)
	    	  streams.get(is.room) match {
	    	    case Some(str) =>  reply(new StreamPublishingReply(true, str.width, str.height))
	    	    case None => reply(new StreamPublishingReply(false, 0, 0))
	    	  }
	      	}
	      case m: Any => log.warning("Receive unknown message: " + m)
	    }
	  }
	}
 
	def createStream(room: String, width: Int, height: Int): Stream = {	
  		val scope: IScope = app.getAppScope().getScope(room)	
		val stream = new DeskshareStream(scope, room, width, height)
  		stream.start
		this ! new AddStream(room, stream)
		return stream
	}
 
  	def destroyStream(room: String) {
  		this ! new RemoveStream(room)
  	}
      
   case class StreamStarted(room: String)
   case class StreamStopped(room: String)
   
   class ClientInvoker extends Actor {
     def act() = {
       loop {
         receive {
           case so: StreamStopped => println("Got stream stopped"); notifyClientOfStreamStopped(so.room)
           case sa: StreamStarted => notifyClientOfStreamStarted(sa.room)
         }
       }
     }
     
     private def notifyClientOfStreamStarted(room: String) {
		val deskSO: ISharedObject  = app.getSharedObject(app.getAppScope().getScope(room), "deskSO")
		log.info("Sending stream started for " + room)
		deskSO.sendMessage("appletStarted" , new ArrayList[Object]())
     }
     
     private def notifyClientOfStreamStopped(room: String) {
		val deskSO: ISharedObject  = app.getSharedObject(app.getAppScope().getScope(room), "deskSO")
		log.info("Sending stream stopped for " + room)
		deskSO.sendMessage("deskshareStreamStopped" , new ArrayList[Object]())
     }
   }
  	
}
