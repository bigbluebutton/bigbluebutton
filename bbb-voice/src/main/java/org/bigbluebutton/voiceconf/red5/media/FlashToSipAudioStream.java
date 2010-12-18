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

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
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

	private final PipedOutputStream streamFromFlash;
	private PipedInputStream streamToSip;
	
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
		streamFromFlash = new PipedOutputStream();
		try {
			streamToSip = new PipedInputStream(streamFromFlash);
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
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
//		    	  System.out.println("RTMP data lenght = " + data.length);
		    	  try {
					streamFromFlash.write(data, 1, data.length-1);
				} catch (IOException e) {
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
		int len = 64;
		byte[] nellyAudio = new byte[len];		
		int remaining = len;
		int offset = 0;
		long startProc;
		boolean transcoded = false;
		while (processAudioData) {			
			try {
				startProc = System.currentTimeMillis();
				if (streamToSip.available() > 1000) {
					long skipped = streamToSip.skip(1000L);
	//				System.out.println("   Skipping RTMP audio bytes[" + skipped + "]");
				}
				int bytesRead =  streamToSip.read(nellyAudio, offset, remaining);
				remaining -= bytesRead;
				if (remaining == 0) {
					remaining = len;
					offset = 0;
					transcoder.transcode(nellyAudio, 0, nellyAudio.length, new TranscodedAudioListener());
					transcoded = true;
				} else {
					offset += bytesRead; 
				}
	//			System.out.println("F2S transcode ms=" + (System.currentTimeMillis()-startProc) + " coded " + transcoded);
				transcoded = false;
			} catch (IOException e) {
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
