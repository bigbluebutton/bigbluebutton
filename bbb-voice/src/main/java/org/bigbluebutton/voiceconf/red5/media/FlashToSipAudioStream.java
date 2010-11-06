/** 
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
**/
package org.bigbluebutton.voiceconf.red5.media;

import java.net.DatagramSocket;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.voiceconf.red5.media.transcoder.FlashToSipTranscoder;
import org.bigbluebutton.voiceconf.red5.media.transcoder.TranscodedAudioDataListener;
import org.bigbluebutton.voiceconf.sip.SipConnectInfo;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.SerializeUtils;
import org.slf4j.Logger;

public class FlashToSipAudioStream {
	private final static Logger log = Red5LoggerFactory.getLogger(FlashToSipAudioStream.class, "sip");

	private final BlockingQueue<AudioByteData> audioDataQ = new LinkedBlockingQueue<AudioByteData>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable audioDataProcessor;
	private volatile boolean processAudioData = false;
	
	private final FlashToSipTranscoder transcoder;	
	private IStreamListener mInputListener;
	private final DatagramSocket srcSocket;
	private final SipConnectInfo connInfo;
	private String talkStreamName;	
	private RtpStreamSender rtpSender;
	
	public FlashToSipAudioStream(final FlashToSipTranscoder transcoder, DatagramSocket srcSocket, SipConnectInfo connInfo) {
		this.transcoder = transcoder;
		this.srcSocket = srcSocket;
		this.connInfo = connInfo;		
		talkStreamName = "microphone_" + System.currentTimeMillis();
	}
	
	public void start(IBroadcastStream broadcastStream, IScope scope) throws StreamException {
	    log.debug("startTranscodingStream({},{})", broadcastStream.getPublishedName(), scope.getName());
	
		mInputListener = new IStreamListener() {
			public void packetReceived(IBroadcastStream broadcastStream, IStreamPacket packet) {
		      IoBuffer buf = packet.getData();
		      if (buf != null)
		    	  buf.rewind();
		    
		      if (buf == null || buf.remaining() == 0){
		    	  log.debug("skipping empty packet with no data");
		    	  return;
		      }
		      		      
		      if (packet instanceof AudioData) {
		    	  byte[] data = SerializeUtils.ByteBufferToByteArray(buf);
				  AudioByteData abd = new AudioByteData(data);
				  try {
					  audioDataQ.put(abd);
				  } catch (InterruptedException e) {
					  // TODO Auto-generated catch block
					  e.printStackTrace();
				  }		    			  		    	  
		      } 
			}
		};
				
	    broadcastStream.addStreamListener(mInputListener);    
	    rtpSender = new RtpStreamSender(srcSocket, connInfo);
		rtpSender.connect();
				
		processAudioData = true;	    
	    audioDataProcessor = new Runnable() {
    		public void run() {
    			processAudioData();   			
    		}
    	};
    	exec.execute(audioDataProcessor);
	}

	private void processAudioData() {
		while (processAudioData) {
			try {
				AudioByteData abd = audioDataQ.take();
				transcoder.transcode(abd, 1, abd.getData().length-1, new TranscodedAudioListener());
			} catch (InterruptedException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}        		
		}	
	}
	
	public void stop(IBroadcastStream broadcastStream, IScope scope) {
		broadcastStream.removeStreamListener(mInputListener);
		processAudioData = false;
	}

	public String getStreamName() {
		return talkStreamName;
	}
	
	private class TranscodedAudioListener implements TranscodedAudioDataListener {
		@Override
		public void handleTranscodedAudioData(byte[] audioData, long timestamp) {
			if (audioData != null) {
	  		  rtpSender.sendAudio(audioData, transcoder.getCodecId(), timestamp);
	  	  } else {
	  		  log.warn("Transcodec audio is null. Discarding.");
	  	  }
		}		
	}
}
