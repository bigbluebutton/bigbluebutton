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
import org.red5.server.stream.AbstractStream;
import org.red5.server.stream.message.RTMPMessage;
import org.slf4j.Logger;
import org.red5.server.api.stream.IStreamPacket;;

public class AudioBroadcastStream implements IBroadcastStream, IProvider, IPipeConnectionListener {
	final private Logger log = Red5LoggerFactory.getLogger(AudioBroadcastStream.class, "sip");
	
	private Set<IStreamListener> streamListeners = new CopyOnWriteArraySet<IStreamListener>();
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

	public AudioBroadcastStream(String name) {
		publishedStreamName = name;
		livePipe = null;
		log.trace("publishedStreamName: {}", name);

		streamCodecInfo = new StreamCodecInfo();
		creationTime = null;
	}

	public IProvider getProvider() {
		log.trace("getProvider()");
		return this;
	}

	public Notify getMetaData() {
		log.debug("**** GETTING METADATA ******");
		return null;
	}

	public String getPublishedName()  {
		log.trace("getPublishedName()");
		return publishedStreamName;
	}

	public String getSaveFilename() {
		log.trace("getSaveFilename()");
		throw new Error("unimplemented method");
	}

	public void addStreamListener(IStreamListener listener) {
		log.trace("addStreamListener(listener: {})", listener);
		streamListeners.add(listener);
	}

	public Collection<IStreamListener> getStreamListeners() {
		log.trace("getStreamListeners()");
		return streamListeners;
	}

	public void removeStreamListener(IStreamListener listener) {
		log.trace("removeStreamListener({})", listener);
		streamListeners.remove(listener);
	}

	public void saveAs(String filePath, boolean isAppend) 
			throws IOException, ResourceNotFoundException, ResourceExistException {
		log.trace("saveAs(filepath:{}, isAppend:{})", filePath, isAppend);
		throw new Error("unimplemented method");
	}

	public void setPublishedName(String name) {
		log.trace("setPublishedName(name:{})", name);
		publishedStreamName = name;
	}

	public void close()	{
		log.trace("close()");
	}

	public IStreamCodecInfo getCodecInfo() {
		//    log.trace("getCodecInfo()");
		// we don't support this right now.
		return streamCodecInfo;
	}

	public String getName() {
		log.trace("getName(): {}", publishedStreamName);
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
		log.debug("Starting AudioBroadcastStream()");
		creationTime = System.currentTimeMillis();
		startTime = creationTime;
	}

	public void stop() {
		log.debug("Stopping AudioBroadcastStream");
	}

	public void onOOBControlMessage(IMessageComponent source, IPipe pipe, OOBControlMessage oobCtrlMsg) {
		log.trace("onOOBControlMessage");
	}


	public void onPipeConnectionEvent(PipeConnectionEvent event) {
		log.trace("onPipeConnectionEvent(event:{})", event);
		if (event.getType() == PipeConnectionEvent.EventType.PROVIDER_CONNECT_PUSH) {
			log.trace("PipeConnectionEvent.PROVIDER_CONNECT_PUSH");
			System.out.println("PipeConnectionEvent.PROVIDER_CONNECT_PUSH");
			if (event.getProvider() == this
					&& (event.getParamMap() == null
					|| !event.getParamMap().containsKey("record"))) {
				log.trace("Creating a live pipe");
				this.livePipe = (IPipe) event.getSource();
			}
		} else if (event.getType() == PipeConnectionEvent.EventType.PROVIDER_DISCONNECT) {
			log.trace("PipeConnectionEvent.PROVIDER_DISCONNECT");
			if (this.livePipe == event.getSource()) {
				log.trace("PipeConnectionEvent.PROVIDER_DISCONNECT - this.mLivePipe = null;");
				this.livePipe = null;
			}
		}
	}
	
	public void dispatchEvent(IEvent event) {
//		log.trace("dispatchEvent(event:{})", event);
		if (event instanceof IRTMPEvent) {
			IRTMPEvent rtmpEvent = (IRTMPEvent) event;
			if (livePipe != null) {
				RTMPMessage msg = RTMPMessage.build(rtmpEvent);
				//RTMPMessage msg = new RTMPMessage();
				//msg.setBody(rtmpEvent);
          
				if (creationTime == null)
					creationTime = (long)rtmpEvent.getTimestamp();
          
				try {

//					log.debug("dispatchEvent(event:)" + event);
					livePipe.pushMessage(msg);

					if (rtmpEvent instanceof IStreamPacket) {
//						log.debug("dispatchEvent(IStreamPacket:)" + event);
						for (IStreamListener listener : getStreamListeners()) {
							try {
//								log.debug("dispatchEvent(event:)" + event);
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
