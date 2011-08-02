package org.bigbluebutton.app.video;

import java.util.HashMap;
import java.util.Map;
import org.apache.mina.core.buffer.IoBuffer;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.VideoData;

/**
 * Class to listen for the first video packet of the webcam.
 * We need to listen for the first packet and send a startWebcamEvent.
 * The reason is that when starting the webcam, sometimes Flash Player
 * needs to prompt the user for permission to access the webcam. However,
 * while waiting for the user to click OK to the prompt, Red5 has already
 * called the startBroadcast method which we take as the start of the recording.
 * When the user finally clicks OK, the packets then start to flow through.
 * This introduces a delay of when we assume the start of the recording and
 * the webcam actually publishes video packets. When we do the ingest and
 * processing of the video and multiplex the audio, the video and audio will
 * be un-synched by at least this amount of delay. 
 * @author Richard Alam
 *
 */
public class VideoStreamListener implements IStreamListener {
	private EventRecordingService recordingService;
	private volatile boolean firstPacketReceived = false;
	
	@Override
	public void packetReceived(IBroadcastStream stream, IStreamPacket packet) {
	      IoBuffer buf = packet.getData();
	      if (buf != null)
	    	  buf.rewind();
	    
	      if (buf == null || buf.remaining() == 0){
	    	  return;
	      }
	      	      
	      if (packet instanceof VideoData) {
	    	  if (! firstPacketReceived) {
	    		  firstPacketReceived = true;
	    		  IConnection conn = Red5.getConnectionLocal(); 
	    		  Map<String, String> event = new HashMap<String, String>();
	    		  event.put("module", "WEBCAM");
	    		  event.put("timestamp", new Long(System.currentTimeMillis()).toString());
	    		  event.put("meetingId", conn.getScope().getName());
	    		  event.put("stream", stream.getPublishedName());
	    		  event.put("eventName", "StartWebcamShareEvent");
	    			
	    		  recordingService.record(conn.getScope().getName(), event);
	    	  }
	      } 
	}
	
	public void setEventRecordingService(EventRecordingService s) {
		recordingService = s;
	}

}
