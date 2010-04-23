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
	    receive {
	      case StartStream => startStream()
	      case StopStream => stopStream()
	      case us: UpdateStream => updateStream(us)
	      case m:Any => log.warning("DeskshareStream: Unknown message " + m);
	    }
	  }
	}
 
	private def stopStream() = {
		log.debug("DeskShareStream: Stopping stream %s", name)
		log.info("DeskShareStream: Sending deskshareStreamStopped for %s", name)
		deskSO.sendMessage("deskshareStreamStopped" , new ArrayList[Object]())
		broadcastStream.stop()
	    broadcastStream.close()	  
	    exit()
	}
	
	private def startStream() = {
	  log.debug("DeskShareStream: Starting stream %s", name)

	  val context: IContext  = scope.getContext()
		
	  val providerService: IProviderService  = context.getBean(IProviderService.BEAN_NAME).asInstanceOf[IProviderService]
	  if (providerService.registerBroadcastStream(scope, name, broadcastStream)) {
		var bScope: BroadcastScope = providerService.getLiveProviderInput(scope, name, true).asInstanceOf[BroadcastScope]			
		bScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, broadcastStream)
	  } else{
		log.error("DeskShareStream: ould not register broadcast stream")
	  }
   
	  log.info("DeskShareStream: Sending appletStarted for " + name)
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
 
	override def  exit() : Nothing = {
	  log.warning("DeskShareStream: **** Exiting  Actor for room %s", name)
	  super.exit()
	}
 
	override def exit(reason : AnyRef) : Nothing = {
	  log.warning("DeskShareStream: **** Exiting Actor %s for room %s", reason, name)
	  super.exit(reason)
	}
}
