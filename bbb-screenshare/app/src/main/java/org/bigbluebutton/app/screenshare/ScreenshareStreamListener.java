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
package org.bigbluebutton.app.screenshare;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.common2.redis.RedisStorageService;
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
public class ScreenshareStreamListener implements IStreamListener {
	private RedisStorageService recordingService;
	private volatile boolean firstPacketReceived = false;
	private String recordingDir;
	
	public ScreenshareStreamListener(RedisStorageService s, String recordingDir) {
	  this.recordingService = s;
	  this.recordingDir = recordingDir;
	}
	
  private Long genTimestamp() {
  	return TimeUnit.NANOSECONDS.toMillis(System.nanoTime());
  }
  
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
	    		  
	    		  String meetingId = conn.getScope().getName();
	    		  
	          String filename = recordingDir;
	          if (!filename.endsWith("/")) {
	            filename.concat("/");
	          } 
	          
	          filename = filename.concat(meetingId).concat("/").concat(stream.getPublishedName()).concat(".flv");
	          
	    		  Map<String, String> event = new HashMap<String, String>();
	    		  event.put("module", "Deskshare");
	    		  event.put("timestamp", genTimestamp().toString());
	    		  event.put("meetingId", meetingId);
	    		  event.put("file", filename);
	    		  event.put("stream", stream.getPublishedName());
	    		  event.put("eventName", "DeskshareStartedEvent");
	    			
	    		  recordingService.record(conn.getScope().getName(), event);
	    	  }
	      } 
	}
	
}
