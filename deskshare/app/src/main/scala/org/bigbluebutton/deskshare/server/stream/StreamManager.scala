package org.bigbluebutton.deskshare.server.stream

import org.bigbluebutton.deskshare.server.red5.DeskshareApplication
import org.red5.server.api.IScope
import org.red5.server.api.so.ISharedObject
import java.util.HashMap
import java.util.ArrayList
import scala.actors.Actor
import scala.actors.Actor._

case class IsStreamPublishing(room: String)
case class StreamPublishingReply(publishing: Boolean, width: Int, height: Int)

class StreamManager extends Actor {
	var app: DeskshareApplication = null
 
	def setDeskshareApplication(a: DeskshareApplication) {
	  app = a
	}
	
  	private case class AddStream(room: String, stream: DeskshareStream)
  	private case class RemoveStream(room: String)

	private val streams = new HashMap[String, DeskshareStream]()
	private val clientInvoker: ClientInvoker = new ClientInvoker()
	clientInvoker.start
 
	def act() = {
	  loop {
	    react {
	      case cs: AddStream => {
	    	  println("Adding stream")
	    	  streams.put(cs.room, cs.stream)
	    	  clientInvoker ! new StreamStarted(cs.room)
	        }
	      case ds: RemoveStream => {
	    	  println("Removing Stream")
	    	  val stream = streams.remove(ds.room)
	    	  println("Removed Stream. Exiting Stream")
	    	  println("Notifying client that stream has stopped")
	    	  clientInvoker ! new StreamStopped(ds.room)
	      	}
	      case is: IsStreamPublishing => {
	    	  println("Received IsStreamPublishing message")
	    	  val stream: DeskshareStream = streams.get(is.room)
	    	  if (stream != null) {
	    	    reply(new StreamPublishingReply(true, stream.width, stream.height))
	    	  } else {
	    	    reply(new StreamPublishingReply(false, 0, 0))
	    	  }
	      	}
	      case m: Any => println("Receive unknown message: " + m)
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
		val deskSO: ISharedObject  = app.getSharedObject(app.getAppScope().getScope(room), "deskSO");
		println("Sending applet started");
		deskSO.sendMessage("appletStarted" , new ArrayList[Object]());
     }
     
     private def notifyClientOfStreamStopped(room: String) {
		val deskSO: ISharedObject  = app.getSharedObject(app.getAppScope().getScope(room), "deskSO");
		println("Sending deskshareStreamStopped stopped");
		deskSO.sendMessage("deskshareStreamStopped" , new ArrayList[Object]());
     }
   }
  	
}
