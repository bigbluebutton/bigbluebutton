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
package org.bigbluebutton.deskshare.server.stream

import org.bigbluebutton.deskshare.server.red5.DeskshareApplication
import org.red5.server.api.scope.IScope
import org.red5.server.api.so.ISharedObject

import java.io.{PrintWriter, StringWriter}
import java.util.ArrayList

import scala.actors.Actor
import scala.actors.Actor._
import scala.collection.mutable.HashMap
import org.bigbluebutton.deskshare.server.recorder._

import net.lag.logging.Logger

case class IsStreamPublishing(room: String)
case class StreamPublishingReply(publishing: Boolean, width: Int, height: Int)

class StreamManager(record:Boolean, recordingService:RecordingService) extends Actor {
	private val log = Logger.get
 
	var app: DeskshareApplication = null
 	
	def setDeskshareApplication(a: DeskshareApplication) {
	  app = a
	}

  	private case class AddStream(room: String, stream: DeskshareStream)
  	private case class RemoveStream(room: String)

	private val streams = new HashMap[String, DeskshareStream]
 
	override def exceptionHandler() = {
	  case e: Exception => {
	    val sw:StringWriter = new StringWriter()
	    sw.write("An exception has been thrown on StreamManager, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
	    e.printStackTrace(new PrintWriter(sw))
	    log.error(sw.toString())
	  }
	}

	def act() = {
	  loop {
	    react {
	      case cs: AddStream => {
	    	  log.debug("StreamManager: Adding stream %s", cs.room)
	    	  streams += cs.room -> cs.stream
	        }
	      case ds: RemoveStream => {
	    	  log.debug("StreamManager: Removing Stream %s", ds.room)
	    	  streams -= ds.room
	      	}
	      case is: IsStreamPublishing => {
	    	  log.debug("StreamManager: Received IsStreamPublishing message for %s", is.room)
	    	  streams.get(is.room) match {
	    	    case Some(str) =>  reply(new StreamPublishingReply(true, str.width, str.height))
	    	    case None => reply(new StreamPublishingReply(false, 0, 0))
	    	  }
	      	}
	      case m: Any => log.warning("StreamManager: StreamManager received unknown message: %s", m)
	    }
	  }
	}
 
	def createStream(room: String, width: Int, height: Int): Option[DeskshareStream] = {	  	  
	  try {                  
	    log.debug("StreamManager: Creating stream for [ %s ]", room)
		val stream = new DeskshareStream(app, room, width, height, record, recordingService.getRecorderFor(room))
	    log.debug("StreamManager: Initializing stream for [ %s ]", room)
		if (stream.initializeStream) {
		  log.debug("StreamManager: Starting stream for [ %s ]", room)
		  stream.start
		  this ! new AddStream(room, stream)
		  return Some(stream)
		} else {
		  log.debug("StreamManager: Failed to initialize stream for [ %s ]", room)
		  return None
		}  		
	  } catch {
			case nl: java.lang.NullPointerException => 
			  	log.error("StreamManager: %s", nl.toString())
			  	nl.printStackTrace
			  	return None			  	
			case _ => log.error("StreamManager:Exception while creating stream for [ %s ]", room); return None
	  }
	}
 
	def destroyStream(room: String) {
		streams.get(room) match {
			case Some(stream) => stream.destroyStream()
			case None => log.info("Tried to destroy, but could not find deskshare stream for room [ %s ]", room)
		}
		this ! new RemoveStream(room)
	}
   
  	override def exit() : Nothing = {
	  log.warning("StreamManager: **** Exiting  Actor")
	  super.exit()
	}
 
	override def exit(reason : AnyRef) : Nothing = {
	  log.warning("StreamManager: **** Exiting Actor with reason %s")
	  super.exit(reason)
	}
}
