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

import org.bigbluebutton.deskshare.server.recorder.Recorder
import org.bigbluebutton.deskshare.server.red5.DeskshareApplication
import org.bigbluebutton.deskshare.server.ScreenVideoBroadcastStream
import org.bigbluebutton.deskshare.server.RtmpClientAdapter
import org.red5.server.api.IContext
import org.red5.server.api.scope.{IScope, IBroadcastScope}
import org.red5.server.api.so.ISharedObject
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.stream.IProviderService
import org.red5.server.net.rtmp.message.Constants;
import org.apache.mina.core.buffer.IoBuffer
import java.io.{PrintWriter, StringWriter}
import java.util.ArrayList
import scala.actors.Actor
import scala.actors.Actor._

import net.lag.logging.Logger

class DeskshareStream(app: DeskshareApplication, name: String, val width: Int, val height: Int, record: Boolean, recorder: Recorder) extends Stream {
	private val log = Logger.get
	private var broadcastStream:ScreenVideoBroadcastStream = null 
	private var dsClient:RtmpClientAdapter = null
		
	var startTimestamp: Long = System.currentTimeMillis()

	override def exceptionHandler() = {
	  case e: Exception => {
	    val sw:StringWriter = new StringWriter()
	    sw.write("An exception has been thrown on DeskshareStream, exception message [" + e.getMessage() + "] (full stacktrace below)\n")
	    e.printStackTrace(new PrintWriter(sw))
	    log.error(sw.toString())
	  }
	}
 
	def act() = {
	  loop {
	    react {
	      case StartStream => startStream()
	      case StopStream => stopStream()
	      case us: UpdateStream => updateStream(us)
	      case ml: UpdateStreamMouseLocation => updateStreamMouseLocation(ml)
	      case m:Any => log.warning("DeskshareStream: Unknown message " + m);
	    }
	  }
	}
 
	def initializeStream():Boolean = {
	   app.createScreenVideoBroadcastStream(name) match {
	     case None => return false
	     case Some(bs) => {
	     		broadcastStream = bs; 
		       	app.createDeskshareClient(name) match {
				     case None => return false
				     case Some(dsc:RtmpClientAdapter) => {
				     		dsClient = dsc; 
				     		recorder.addListener(dsClient)
				     		return true
				     }       
		       }	
	       }     	
	   } 
	   return false
	}

	def destroyStream():Boolean = {
		return app.destroyScreenVideoBroadcastStream(name)
	}
 
	private def stopStream() = {
		log.debug("DeskShareStream: Stopping stream %s", name)
		log.info("DeskShareStream: Sending deskshareStreamStopped for %s", name)
		if (record) {
	  		recorder.stop()
	  	}
		dsClient.sendDeskshareStreamStopped(new ArrayList[Object]())
		broadcastStream.stop()
	    broadcastStream.close()	  
	    exit()
	}
	
	private def startStream() = {
	  log.debug("DeskShareStream: Starting stream %s", name)
	  if (record) {
	  	recorder.start()
	  }
   	  dsClient.sendDeskshareStreamStarted(width, height)
	}
	
	private def updateStreamMouseLocation(ml: UpdateStreamMouseLocation) = {
		dsClient.sendMouseLocation(ml.loc)
	}
 
	private def updateStream(us: UpdateStream) {
		val buffer: IoBuffer  = IoBuffer.allocate(us.videoData.length, false);
		buffer.put(us.videoData);
		
		/* Set the marker back to zero position so that "gets" start from the beginning.
		 * Otherwise, you get BufferUnderFlowException.
		 */		
		buffer.rewind();
		
		if (record) {
			recorder.record(buffer)
		}	

		val data: VideoData = new VideoData(buffer)
		data.setSourceType(Constants.SOURCE_TYPE_LIVE);
	    /*
	     * Use timestamp increments. This will force
	     * Flash Player to playback at proper timestamp. If we calculate timestamp using
	     * System.currentTimeMillis() - startTimestamp, the video has tendency to drift and
	     * introduce delay. See how we do the voice. (ralam may 10, 2012)
	     */
        data.setTimestamp(us.timestamp.toInt);
		broadcastStream.dispatchEvent(data)
		data.release()
		
	}
 
	override def  exit() : Nothing = {
	  log.warning("DeskShareStream: **** Exiting  Actor for room %s", name)
	  super.exit()
	}
 
	override def exit(reason : AnyRef) : Nothing = {
	  log.warning("DeskShareStream: **** Exiting Actor %s for room %s", reason, name)
	  super.exit(reason)
	}
}
