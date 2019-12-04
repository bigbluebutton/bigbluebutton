package org.red5.app.sip;

import java.io.IOException;
import java.util.Collection;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.stream.IBroadcastStream;
import org.red5.codec.IStreamCodecInfo;
import org.red5.codec.StreamCodecInfo;
import org.red5.server.api.stream.IStreamListener;
import org.red5.server.api.stream.ResourceExistException;
import org.red5.server.api.stream.ResourceNotFoundException;
import org.red5.server.messaging.IMessageComponent;
import org.red5.server.messaging.IPipe;
import org.red5.server.messaging.IPipeConnectionListener;
import org.red5.server.messaging.IProvider;
import org.red5.server.messaging.OOBControlMessage;
import org.red5.server.messaging.PipeConnectionEvent;
import org.red5.server.net.rtmp.event.IRTMPEvent;
import org.red5.server.net.rtmp.event.Notify;
import org.red5.server.stream.message.RTMPMessage;
import org.slf4j.Logger;
import org.red5.server.api.stream.IStreamPacket;;

public class AudioStream implements IBroadcastStream, IProvider, IPipeConnectionListener {
	/** Listeners to get notified about received packets. */
	private Set<IStreamListener> streamListeners = new CopyOnWriteArraySet<IStreamListener>();
	final private Logger log = Red5LoggerFactory.getLogger(AudioStream.class, "sip");

	private String publishedStreamName;
	private IPipe livePipe;
	private IScope scope;

	// Codec handling stuff for frame dropping
	private StreamCodecInfo streamCodecInfo;
	private Long creationTime;

	/**
	 * Timestamp the stream was started.
	 */
	private Long startTime;
	
	public AudioStream(String name) {
		publishedStreamName = name;
		livePipe = null;
		streamCodecInfo = new StreamCodecInfo();
		creationTime = null;
	}

	public IProvider getProvider() {
		return this;
	}

	public Notify getMetaData() {
		return null;
	}

	public String getPublishedName()  {
		return publishedStreamName;
	}

	public String getSaveFilename() {
		throw new Error("unimplemented method");
	}

	public void addStreamListener(IStreamListener listener) {
		log.trace("addStreamListener(listener: {})", listener);
		streamListeners.add(listener);
	}

	public Collection<IStreamListener> getStreamListeners() {
		return streamListeners;
	}

	public void removeStreamListener(IStreamListener listener) {
		log.trace("removeStreamListener({})", listener);
		streamListeners.remove(listener);
	}

	public void saveAs(String filePath, boolean isAppend) throws IOException, ResourceNotFoundException, ResourceExistException {
		throw new Error("unimplemented method");
	}

	public void setPublishedName(String name) {
		publishedStreamName = name;
	}

	public void close()	{
		log.trace("close()");
	}

	public IStreamCodecInfo getCodecInfo() {
		return streamCodecInfo;
	}

	public String getName() {
		// for now, just return the published name
		return publishedStreamName;
	}

	public void setScope(IScope scope) {
		this.scope = scope;
	}

	public IScope getScope() {
		log.trace("getScope(): {}", scope);
		return scope;
	}

	public void start() {
		log.trace("start()");
		creationTime = System.currentTimeMillis();
		startTime = creationTime;
	}

	public void stop() {
		log.trace("stop");
	}

	public void onOOBControlMessage(IMessageComponent source, IPipe pipe, OOBControlMessage oobCtrlMsg) {
		log.trace("onOOBControlMessage");
	}

	public void onPipeConnectionEvent(PipeConnectionEvent event) {
		log.trace("onPipeConnectionEvent(event:{})", event);
		if (event.getType() == PipeConnectionEvent.EventType.PROVIDER_CONNECT_PUSH) {
			log.trace("PipeConnectionEvent.PROVIDER_CONNECT_PUSH");
			System.out.println("PipeConnectionEvent.PROVIDER_CONNECT_PUSH");
			if (event.getProvider() == this && (event.getParamMap() == null || !event.getParamMap().containsKey("record"))) {
				log.trace("Creating a live pipe");
				System.out.println("Creating a live pipe");
				this.livePipe = (IPipe) event.getSource();
			}
		} else if(event.getType() == PipeConnectionEvent.EventType.PROVIDER_DISCONNECT) {
			log.trace("PipeConnectionEvent.PROVIDER_DISCONNECT");
			if (this.livePipe == event.getSource()) {
				log.trace("PipeConnectionEvent.PROVIDER_DISCONNECT - this.mLivePipe = null;");
				this.livePipe = null;
			}
		}
	}

	public void dispatchEvent(IEvent event) {
		//      log.trace("dispatchEvent(event:{})", event);
		//    	System.out.println("dispatchEvent(event:)" + event);
		if (event instanceof IRTMPEvent) {
			IRTMPEvent rtmpEvent = (IRTMPEvent) event;
			if (livePipe != null) {
				RTMPMessage msg = RTMPMessage.build(rtmpEvent);
				//RTMPMessage msg = new RTMPMessage();
				//msg.setBody(rtmpEvent);
				
				if (creationTime == null)
					creationTime = (long)rtmpEvent.getTimestamp();
          
				try {
//					System.out.println("dispatchEvent(event:)" + event);
					livePipe.pushMessage(msg);

					if (rtmpEvent instanceof IStreamPacket) {
//						System.out.println("dispatchEvent(IStreamPacket:)" + event);
						for (IStreamListener listener : getStreamListeners()) {
							try {
//								System.out.println("dispatchEvent(event:)" + event);
								listener.packetReceived(this, (IStreamPacket) rtmpEvent);
							} catch (Exception e) {
								log.error("Error while notifying listener " + listener, e);
							}
						}
					} 	          	  
				} catch (IOException ex) {
					log.error("Got exception: {}", ex);
				}
			}
		}
	}

	public long getCreationTime() {
		return creationTime != null ? creationTime : 0L;
	}

	public long getStartTime() {
		return startTime != null ? startTime : 0L;
	}
}
