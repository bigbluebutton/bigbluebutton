package org.red5.app.sip.stream;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.apache.mina.core.buffer.IoBuffer;
import org.red5.app.sip.RtmpAudioData;
import org.red5.app.sip.trancoders.Transcoder;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.IStreamPacket;
import org.red5.server.net.rtmp.event.AudioData;
import org.red5.server.net.rtmp.event.SerializeUtils;
import org.slf4j.Logger;

public class TalkStream {
	private final static Logger log = Red5LoggerFactory.getLogger(TalkStream.class, "sip");

	private final Transcoder transcoder;
	private final RtpStreamSender rtpSender;
	private final IStreamListener mInputListener;
	
	private BlockingQueue<RtmpAudioData> packets = new LinkedBlockingQueue<RtmpAudioData>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable audioProcessor;
	private volatile boolean processAudio = false;
	
	private final String talkStreamName;
	
	public TalkStream(final Transcoder transcoder, final RtpStreamSender rtpSender) {
		this.transcoder = transcoder;
		this.rtpSender = rtpSender;
		talkStreamName = "microphone_" + System.currentTimeMillis();
		
		mInputListener = new IStreamListener() {
			public void packetReceived(IBroadcastStream broadcastStream, IStreamPacket packet) {
		      IoBuffer buf = packet.getData();
		      if (buf != null)
		    	buf.rewind();
		    
		      if (buf == null || buf.remaining() == 0){
		    	log.debug("skipping empty packet with no data");
		    	System.out.println("skipping empty packet with no data");
		    	return;
		      }
		          
		      if (packet instanceof AudioData) {
		    	try {
		            byte[] data = SerializeUtils.ByteBufferToByteArray(buf);
		            RtmpAudioData audioData = new RtmpAudioData(data);
//		            System.out.println("Adding data " + data.length);
					packets.put(audioData);
		    	} catch (InterruptedException e) {
					log.info("Interrupted exception while queieing audio packet");
		    	}		    			  
		      } 
			}
		};		    
	}
	
	public void start(IBroadcastStream broadcastStream, IScope scope) {
	    log.debug("startTranscodingStream({},{})", broadcastStream.getPublishedName(), scope.getName());
	    broadcastStream.addStreamListener(mInputListener);
	    
	    processAudio = true;
	    audioProcessor = new Runnable() {
			public void run() {
				while (processAudio) {
					try {
						RtmpAudioData packet = packets.take();
						processAudioPacket(packet);
					} catch (InterruptedException e) {
						log.info("InterruptedExeption while taking audio packet.");
					}
				}
			}
		};
		exec.execute(audioProcessor);	    
	}
	
	private void processAudioPacket(RtmpAudioData packet) {
		byte[] data = packet.getData();
//		System.out.println("Proccessing voice data");
        rtpSender.send(data, 1, data.length-1);
	}
	
	public void stop() {
		processAudio = false;		
	}
	
	public String getStreamName() {
		return talkStreamName;
	}
}
