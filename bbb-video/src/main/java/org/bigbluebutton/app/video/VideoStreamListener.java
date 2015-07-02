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
package org.bigbluebutton.app.video;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.apache.mina.core.buffer.IoBuffer;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scheduling.IScheduledJob;
import org.red5.server.api.scheduling.ISchedulingService;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.VideoData;
import org.red5.server.scheduling.QuartzSchedulingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.logging.Red5LoggerFactory;

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
	private static final Logger log = Red5LoggerFactory.getLogger(VideoStreamListener.class, "video");
	
	private EventRecordingService recordingService;
	private volatile boolean firstPacketReceived = false;
	
	// Maximum time between video packets
    private int videoTimeout = 10000;
 
    // Last time video was received, not video timestamp
    private long lastVideoTime;
 
    // Stream being observed
    private IBroadcastStream stream;
 
    // if this stream is recorded or not
    private boolean record;
    
    // Scheduler
    private QuartzSchedulingService scheduler;
 
    // Event queue worker job name
    private String timeoutJobName;
 
    private volatile boolean publishing = false;
    
    private IScope scope;
    
    public VideoStreamListener(IScope scope, IBroadcastStream stream, Boolean record) {
    	this.scope = scope;
        this.stream = stream;
        this.record = record;
        
        // get the scheduler
        scheduler = (QuartzSchedulingService) scope.getParent().getContext().getBean(QuartzSchedulingService.BEAN_NAME);

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
	          // keep track of last time video was received
	          lastVideoTime = System.currentTimeMillis();
	          
	    	  if (! firstPacketReceived) {
	    		  firstPacketReceived = true;
	    		  publishing = true;
	    		  
		          // start the worker to monitor if we are still receiving video packets
		          timeoutJobName = scheduler.addScheduledJob(videoTimeout, new TimeoutJob());
		          
		          if (record) { 
		    		  Map<String, String> event = new HashMap<String, String>();
		    		  event.put("module", "WEBCAM");
		    		  event.put("timestamp", genTimestamp().toString());
		    		  event.put("meetingId", scope.getName());
		    		  event.put("stream", stream.getPublishedName());
		    		  event.put("eventName", "StartWebcamShareEvent");
		    			
		    		  recordingService.record(scope.getName(), event);
		          }		          
	    	  }
	      } 
	}
	
	public void setEventRecordingService(EventRecordingService s) {
		recordingService = s;
	}
	
	public void streamStopped() {
		this.publishing = false;
	}
	
    private class TimeoutJob implements IScheduledJob {
    	private boolean streamStopped = false;
    	
        public void execute(ISchedulingService service) {
            if ((System.currentTimeMillis() - lastVideoTime) > videoTimeout) {
                log.warn("No data received for stream[{}] in the last few seconds. Close stream.", stream.getPublishedName());
                
                if (!streamStopped) {
                	streamStopped = true;
                    // remove the scheduled job
                    scheduler.removeScheduledJob(timeoutJobName);
                    // stop / clean up
                    if (publishing) {
                    	stream.stop(); 	
                    }
                                   	
                }
            }
        }
 
    }

}
