package org.red5.app.sip.stream;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.red5.app.sip.trancoders.Transcoder;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;
import local.net.RtpPacket;


public class ReceivedRtpPacketProcessor {
	final private Logger log = Red5LoggerFactory.getLogger(ReceivedRtpPacketProcessor.class, "sip");
	
	private BlockingQueue<RtpPacket> packets = new LinkedBlockingQueue<RtpPacket>();
	private final Executor exec = Executors.newSingleThreadExecutor();
	private Runnable packetProcessor;
	private volatile boolean processPacket = false;
	
	private final Transcoder transcoder;
	
	public ReceivedRtpPacketProcessor(Transcoder transcoder) {
		this.transcoder = transcoder;
	}
	
	public void start() {
		processPacket = true;
		packetProcessor = new Runnable() {
			public void run() {
				while (processPacket) {
					try {					
						RtpPacket packet = packets.take();
						processPacket(packet);
					} catch (InterruptedException e) {
						log.warn("InterruptedExeption while taking event.");
					}
				}
			}
		};
		exec.execute(packetProcessor);
	}
	
	private void processPacket(RtpPacket packet) {
		byte[] payload = packet.getPayload();
		transcoder.transcode(payload);  
	}
	
	public void process(RtpPacket packet) throws InterruptedException {
		packets.put(packet);
	}
	
	public void stop() {
		System.out.println("processPacket stopped");
		processPacket = false;
		clearQueue();
	}
	
	private void clearQueue() {
		packets.clear();
	}
}
