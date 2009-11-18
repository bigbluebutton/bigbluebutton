package org.red5.app.sip;

import java.util.Iterator;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.stream.BroadcastScope;
import org.red5.server.stream.IBroadcastScope;
import org.red5.server.stream.IProviderService;
import org.slf4j.Logger;

public class ListenStream implements TranscodedAudioDataListener {
	final private Logger log = Red5LoggerFactory.getLogger(ListenStream.class, "sip");
	
	private BlockingQueue<AudioData> audioDataQ = new LinkedBlockingQueue<AudioData>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable audioStreamer;
	private volatile boolean streamAudio = false;
	
	private AudioStream broadcastStream;
	private IScope scope;
	private final String listenStreamName;
	
	public ListenStream(IScope scope) {
		this.scope = scope;
		listenStreamName = "speaker_" + System.currentTimeMillis();
		scope.setName(listenStreamName);	
		Iterator<String> it = scope.getScopeNames();
		while (it.hasNext()) {
			log.debug((String) it.next());
			System.out.println((String) it.next());
		}
	}
	
	public String getStreamName() {
		return listenStreamName;
	}
	
	public void stop() {
		streamAudio = false;
		streamEnded();
	}
	
	public void start() {
		startPublishing(scope);
		
		streamAudio = true;
		audioStreamer = new Runnable() {
			public void run() {
				while (streamAudio) {
					try {					
						AudioData audioData = audioDataQ.take();
						streamAudioData(audioData);
					} catch (InterruptedException e) {
						log.warn("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(audioStreamer);
	}
	
	public void handleTranscodedAudioData(AudioData audioData) {
		try {
			audioDataQ.put(audioData);
		} catch (InterruptedException e) {
			log.warn("InterruptedException while putting event into queue.");
		}
	}
	
	private void streamAudioData(AudioData audioData) {
		long now = System.currentTimeMillis();
		broadcastStream.dispatchEvent(audioData);
		audioData.release();
		long completeRx = System.currentTimeMillis();
//		System.out.println("Send took " + (completeRx - startRx) + "ms.");
	}

	private void streamEnded() {
		broadcastStream.stop();
	    broadcastStream.close();
	    log.debug("stopping and closing stream {}", listenStreamName);
	}
	
	private void startPublishing(IScope aScope){
		System.out.println("started publishing stream in " + aScope.getName());

		broadcastStream = new AudioStream(listenStreamName);
		broadcastStream.setPublishedName(listenStreamName);
		broadcastStream.setScope(aScope);
		
		IContext context = aScope.getContext();
		
		IProviderService providerService = (IProviderService) context.getBean(IProviderService.BEAN_NAME);
		if (providerService.registerBroadcastStream(aScope, listenStreamName, broadcastStream)){
			IBroadcastScope bScope = (BroadcastScope) providerService.getLiveProviderInput(aScope, listenStreamName, true);
			
			bScope.setAttribute(IBroadcastScope.STREAM_ATTRIBUTE, broadcastStream);
		} else{
			log.error("could not register broadcast stream");
			throw new RuntimeException("could not register broadcast stream");
		}
	    
	    broadcastStream.start();
	}
}
