/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.voiceconf.red5.media;

import java.net.DatagramSocket;
import org.apache.mina.core.buffer.IoBuffer;
import org.bigbluebutton.voiceconf.red5.media.transcoder.SipToFlashTranscoder;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.stream.BroadcastScope;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;

public class SipToFlashAudioStream implements RtpStreamReceiverListener {
	final private Logger log = Red5LoggerFactory.getLogger(SipToFlashAudioStream.class, "sip");
		
	private AudioBroadcastStream audioBroadcastStream;
	private IScope scope;
	private final String listenStreamName;
	private RtpStreamReceiver rtpStreamReceiver;
	private StreamObserver observer;
	private long startTimestamp;
	private SipToFlashTranscoder transcoder;
	
	public SipToFlashAudioStream(IScope scope, SipToFlashTranscoder transcoder, DatagramSocket socket) {
		this.scope = scope;
		this.transcoder = transcoder;
		rtpStreamReceiver = new RtpStreamReceiver(socket, transcoder.getIncomingEncodedFrameSize());
		rtpStreamReceiver.setRtpStreamReceiverListener(this);
		listenStreamName = "speaker_" + System.currentTimeMillis();		
		scope.setName(listenStreamName);	
	}
	
	public String getStreamName() {
		return listenStreamName;
	}
	
	public void addListenStreamObserver(StreamObserver o) {
		observer = o;
	}
	
	public void stop() {
		rtpStreamReceiver.stop();
		audioBroadcastStream.stop();
	    audioBroadcastStream.close();
	    log.debug("stopping and closing stream {}", listenStreamName);
	}
	
	public void start() {
		log.debug("started publishing stream in " + scope.getName());
		audioBroadcastStream = new AudioBroadcastStream(listenStreamName);
		audioBroadcastStream.setPublishedName(listenStreamName);
		audioBroadcastStream.setScope(scope);
		
		IContext context = scope.getContext();
		
		IProviderService providerService = (IProviderService) context.getBean(IProviderService.BEAN_NAME);
		if (providerService.registerBroadcastStream(scope, listenStreamName, audioBroadcastStream)){
			IBroadcastScope bScope = (BroadcastScope) providerService.getLiveProviderInput(scope, listenStreamName, true);			
			bScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, audioBroadcastStream);
		} else{
			log.error("could not register broadcast stream");
			throw new RuntimeException("could not register broadcast stream");
		}
	    startTimestamp = System.currentTimeMillis();
	    audioBroadcastStream.start();
	    rtpStreamReceiver.start();
	}
	
	@Override
	public void onStoppedReceiving() {
		if (observer != null) observer.onStreamStopped();
	}

	@Override
	public void onAudioDataReceived(byte[] audioData) {
		if (audioData != null) {
			byte[] transcodedAudio = transcoder.transcode(audioData);
			pushAudio(transcodedAudio);
		} else {
			log.warn("Transcoded audio is null. Discarding.");
		}
	}
	
	private void pushAudio(byte[] audio) {
        IoBuffer buffer = IoBuffer.allocate(1024);
        buffer.setAutoExpand(true);

        buffer.clear();

        buffer.put((byte) transcoder.getCodecId()); 
        byte[] copy = new byte[audio.length];
	    System.arraycopy(audio, 0, copy, 0, audio.length );
        
        buffer.put(copy);        
        buffer.flip();

        AudioData audioData = new AudioData(buffer);
        audioData.setTimestamp((int)(System.currentTimeMillis() - startTimestamp));
		audioBroadcastStream.dispatchEvent(audioData);
		audioData.release();
    }
}
