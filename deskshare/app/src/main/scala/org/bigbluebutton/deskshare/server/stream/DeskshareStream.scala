package org.bigbluebutton.deskshare.server.stream

import org.bigbluebutton.deskshare.server.ScreenVideoBroadcastStream
import org.red5.server.api.{IContext, IScope}
import org.red5.server.api.so.ISharedObject
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.stream.{BroadcastScope, IBroadcastScope, IProviderService}
import org.apache.mina.core.buffer.IoBuffer
import java.util.ArrayList
import scala.actors.Actor
import scala.actors.Actor._

import net.lag.logging.Logger

class DeskshareStream(val scope: IScope, val deskSO: ISharedObject, name: String, val width: Int, val height: Int) extends Stream {
	private val log = Logger.get
	private val broadcastStream = new ScreenVideoBroadcastStream(name)
	broadcastStream.setPublishedName(name)
	broadcastStream.setScope(scope)

	var startTimestamp: Long = System.currentTimeMillis()
 
	def act() = {
	  loop {
	    react {
	      case StartStream => startStream()
	      case StopStream => stopStream()
	      case us: UpdateStream => updateStream(us)
	    }
	  }
	}
 
	private def stopStream() = {
		log.debug("DeskShareStream Stopping stream %s", name)
		log.info("Sending deskshareStreamStopped for %s", name)
		deskSO.sendMessage("deskshareStreamStopped" , new ArrayList[Object]())
		broadcastStream.stop()
	    broadcastStream.close()	    
	}
	
	private def startStream() = {
	  log.debug("DeskShareStream Starting stream %s", name)

	  val context: IContext  = scope.getContext()
		
	  val providerService: IProviderService  = context.getBean(IProviderService.BEAN_NAME).asInstanceOf[IProviderService]
	  if (providerService.registerBroadcastStream(scope, name, broadcastStream)) {
		var bScope: BroadcastScope = providerService.getLiveProviderInput(scope, name, true).asInstanceOf[BroadcastScope]			
		bScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, broadcastStream)
	  } else{
		log.error("could not register broadcast stream")
	  }
   
	  log.info("Sending appletStarted for " + name)
	  deskSO.sendMessage("appletStarted" , new ArrayList[Object]())
	}
	
	private def updateStream(us: UpdateStream) {
		val buffer: IoBuffer  = IoBuffer.allocate(us.videoData.length, false);
		buffer.put(us.videoData);
		
		/* Set the marker back to zero position so that "gets" start from the beginning.
		 * Otherwise, you get BufferUnderFlowException.
		 */		
		buffer.rewind();	

		val data: VideoData = new VideoData(buffer)
		data.setTimestamp((System.currentTimeMillis() - startTimestamp).toInt)
		broadcastStream.dispatchEvent(data)
		data.release()
	}
}
