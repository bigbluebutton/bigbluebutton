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
package org.bigbluebutton.voiceconf.red5.media;

import java.net.DatagramSocket;

import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.voiceconf.red5.media.transcoder.SipToFlashTranscoder;
import org.bigbluebutton.voiceconf.red5.media.transcoder.TranscodedAudioDataListener;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.scope.IScope;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.net.rtmp.message.Constants;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;

public class SipToFlashAudioStream implements TranscodedAudioDataListener, RtpStreamReceiverListener {
	private static final Logger log = Red5LoggerFactory.getLogger(SipToFlashAudioStream.class, "sip");
	
	private AudioBroadcastStream audioBroadcastStream;
	private IScope scope;
	private final String listenStreamName;
	private RtpStreamReceiver rtpStreamReceiver;
	private StreamObserver observer;
	private SipToFlashTranscoder transcoder;
	private boolean sentMetadata = false;
	private IoBuffer mBuffer;
	private AudioData audioData;
	
	private final byte[] fakeMetadata = new byte[] {
		0x02, 0x00, 0x0a, 0x6f, 0x6e, 0x4d, 0x65, 0x74, 0x61, 0x44, 0x61, 0x74, 0x61, 0x08, 0x00, 0x00,  
		0x00, 0x06, 0x00, 0x08, 0x64, 0x75, 0x72, 0x61, 0x74, 0x69, 0x6f, 0x6e, 0x00, 0x40, 0x31, (byte)0xaf,  
		0x5c, 0x28, (byte)0xf5, (byte)0xc2, (byte)0x8f, 0x00, 0x0f, 0x61, 0x75, 0x64, 0x69, 0x6f, 0x73, 0x61, 0x6d, 0x70, 
		0x6c, 0x65, 0x72, 0x61, 0x74, 0x65, 0x00, 0x40, (byte)0xe5, (byte)0x88, (byte)0x80, 0x00, 0x00, 0x00, 0x00, 0x00,  
		0x0f, 0x61, 0x75, 0x64, 0x69, 0x6f, 0x73, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x73, 0x69, 0x7a, 0x65,  
		0x00, 0x40, 0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x73, 0x74, 0x65, 0x72, 0x65,  
		0x6f, 0x01, 0x00, 0x00, 0x0c, 0x61, 0x75, 0x64, 0x69, 0x6f, 0x63, 0x6f, 0x64, 0x65, 0x63, 0x69,  
		0x64, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0x66, 0x69, 0x6c, 0x65,  
		(byte)0xc8, 0x73, 0x69, 0x7a, 0x65, 0x00, 0x40, (byte)0xf3, (byte)0xf5, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00  
	};
	
	public SipToFlashAudioStream(IScope scope, SipToFlashTranscoder transcoder, DatagramSocket socket) {
		this.scope = scope;
		this.transcoder = transcoder;
		rtpStreamReceiver = new RtpStreamReceiver(socket, transcoder.getIncomingEncodedFrameSize());
		rtpStreamReceiver.setRtpStreamReceiverListener(this);
		listenStreamName = "speaker_" + System.currentTimeMillis();		
		mBuffer = IoBuffer.allocate(1024);
		mBuffer = mBuffer.setAutoExpand(true);
        audioData = new AudioData();
		transcoder.setTranscodedAudioListener(this);
	}
	
	public String getStreamName() {
		return listenStreamName;
	}
	
	public void addListenStreamObserver(StreamObserver o) {
		observer = o;
	}
	
	public void stop() {
		if (log.isDebugEnabled()) log.debug("Stopping stream for {}", listenStreamName);
		transcoder.stop();
		rtpStreamReceiver.stop();
		if (log.isDebugEnabled()) log.debug("Stopped RTP Stream Receiver for {}", listenStreamName);
		if (audioBroadcastStream != null) {
			audioBroadcastStream.stop();
			if (log.isDebugEnabled()) log.debug("Stopped audioBroadcastStream for {}", listenStreamName);
			audioBroadcastStream.close();
		    if (log.isDebugEnabled()) log.debug("Closed audioBroadcastStream for {}", listenStreamName);
		} else {
			if (log.isDebugEnabled()) log.debug("audioBroadcastStream is null, couldn't stop");
		}
		
	   if (log.isDebugEnabled()) log.debug("Stream(s) stopped");
	    
	    if (observer != null) observer.onStreamStopped();
	}
	
	public void start() {
		if (log.isDebugEnabled()) log.debug("started publishing stream in scope=[" + scope.getName() + "] path=[" + scope.getPath() + "]");
		audioBroadcastStream = new AudioBroadcastStream(listenStreamName);
		audioBroadcastStream.setPublishedName(listenStreamName);
		audioBroadcastStream.setScope(scope);
		
		IContext context = scope.getContext();
		
		IProviderService providerService = (IProviderService) context.getBean(IProviderService.BEAN_NAME);
		if (providerService.registerBroadcastStream(scope, listenStreamName, audioBroadcastStream)){
			// Do nothing. Successfully registered a live broadcast stream. (ralam Sept. 4, 2012)
		} else{
			log.error("could not register broadcast stream");
			throw new RuntimeException("could not register broadcast stream");
		}
		
	    audioBroadcastStream.start();	    
		transcoder.start();   	
	    rtpStreamReceiver.start();
	}
	
	@Override
	public void onStoppedReceiving() {
		if (observer != null) observer.onStreamStopped();
	}

	@Override
	public void onAudioDataReceived(byte[] audioData, int offset, int len) {
		transcoder.handleData(audioData, offset, len);
	}
	
	@Override
	public void handleTranscodedAudioData(byte[] audioData, long timestamp) {
		if (audioData != null) {
			pushAudio(audioData, timestamp);
		} else {
			log.warn("Transcoded audio is null. Discarding.");
		}
	}
	
	private void sendFakeMetadata(long timestamp) {
		if (!sentMetadata) {
			/*
			 * Flash Player 10.1 requires us to send metadata for it to play audio.
			 * We create a fake one here to get it going. Red5 should do this automatically
			 * but for Red5 0.91, doesn't yet. (ralam Sept 24, 2010).
			 */
			mBuffer.clear();	        
		    mBuffer.put(fakeMetadata);         
		    mBuffer.flip();

	        Notify notifyData = new Notify(mBuffer);
	        notifyData.setTimestamp((int)timestamp);
	        notifyData.setSourceType(Constants.SOURCE_TYPE_LIVE);
			audioBroadcastStream.dispatchEvent(notifyData);
			notifyData.release();
			sentMetadata = true;
		}		
	}
	
	private void pushAudio(byte[] audio, long timestamp) {		
		sendFakeMetadata(timestamp);
        mBuffer.clear();
        mBuffer.put((byte) transcoder.getCodecId());
	    mBuffer.put(audio);        
	    mBuffer.flip();
	    audioData.setSourceType(Constants.SOURCE_TYPE_LIVE);
	    /*
	     * Use timestamp increments passed in by codecs (i.e. 32 for nelly). This will force
	     * Flash Player to playback audio at proper timestamp. If we calculate timestamp using
	     * System.currentTimeMillis() - startTimestamp, the audio has tendency to drift and
	     * introduce delay. (ralam dec 14, 2010)
	     */
        audioData.setTimestamp((int)(timestamp));
        audioData.setData(mBuffer);
		audioBroadcastStream.dispatchEvent(audioData);
		audioData.release();
    }
}
