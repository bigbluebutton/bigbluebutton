package org.bigbluebutton.voiceconf.red5.media;

import java.net.DatagramSocket;
import org.bigbluebutton.voiceconf.red5.media.transcoder.TranscodedAudioDataListener;
import org.bigbluebutton.voiceconf.red5.media.transcoder.Transcoder;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.stream.BroadcastScope;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;

public class SipToFlashAudioStream implements TranscodedAudioDataListener, RtpStreamReceiverListener {
	final private Logger log = Red5LoggerFactory.getLogger(SipToFlashAudioStream.class, "sip");
		
	private AudioBroadcastStream audioBroadcastStream;
	private IScope scope;
	private final String listenStreamName;
	private RtpStreamReceiver rtpStreamReceiver;
	private StreamObserver observer;
	
	public SipToFlashAudioStream(IScope scope, Transcoder transcoder, DatagramSocket socket) {
		this.scope = scope;
		rtpStreamReceiver = new RtpStreamReceiver(transcoder, socket);
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
	    
	    audioBroadcastStream.start();
	    rtpStreamReceiver.start();
	}
	
	public void handleTranscodedAudioData(AudioData audioData) {
		/* NOTE:
		 * Don't set the timestamp as it results in choppy audio. Let the client
		 * play the audio as soon as they receive the packets. (ralam dec 10, 2009)
		 */
		audioBroadcastStream.dispatchEvent(audioData);
		audioData.release();
	}

	@Override
	public void onStoppedReceiving() {
		if (observer != null) observer.onStreamStopped();
	}
}
