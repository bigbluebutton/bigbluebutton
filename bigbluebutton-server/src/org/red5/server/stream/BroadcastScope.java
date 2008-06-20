package org.red5.server.stream;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 *
 * Copyright (c) 2006-2007 by respective authors (see below). All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 2.1 of the License, or (at your option) any later
 * version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this library; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 */

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.red5.server.BasicScope;
import org.red5.server.api.IScope;
import org.red5.server.messaging.IConsumer;
import org.red5.server.messaging.IMessage;
import org.red5.server.messaging.IPipeConnectionListener;
import org.red5.server.messaging.IProvider;
import org.red5.server.messaging.InMemoryPushPushPipe;
import org.red5.server.messaging.OOBControlMessage;
import org.red5.server.messaging.PipeConnectionEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Scope type for publishing that deals with pipe connection events,
 * like async message listening in JMS.
 */
public class BroadcastScope extends BasicScope implements IBroadcastScope,
		IPipeConnectionListener {
    
    /** Simple in memory push pipe, triggered by an active provider to push messages to consumer. */
	private InMemoryPushPushPipe pipe;
    
    /** Number of components. */
	private int compCounter;
    
    /** Remove flag. */
	private boolean hasRemoved;

    /**
     * Creates broadcast scope.
     * 
     * @param parent            Parent scope
     * @param name              Scope name
     */
	public BroadcastScope(IScope parent, String name) {
		super(parent, TYPE, name, false);
		pipe = new InMemoryPushPushPipe();
		pipe.addPipeConnectionListener(this);
		compCounter = 0;
		hasRemoved = false;
		keepOnDisconnect = true;
	}

    /**
     * Register pipe connection event listener with this scope's pipe.
     * A listener that wants to listen to events when
     * provider/consumer connects to or disconnects from
     * a specific pipe.
     * 
     * @param listener         Pipe connection event listener
     * 
     * @see org.red5.server.messaging.IPipeConnectionListener
     */
	public void addPipeConnectionListener(IPipeConnectionListener listener) {
		pipe.addPipeConnectionListener(listener);
	}

    /**
     * Unregisters pipe connection event listener with this scope's pipe.
     * 
     * @param listener         Pipe connection event listener
     * 
     * @see org.red5.server.messaging.IPipeConnectionListener
     */
	public void removePipeConnectionListener(IPipeConnectionListener listener) {
		pipe.removePipeConnectionListener(listener);
	}

    /**
     * Pull message from pipe.
     * 
     * @return      Message object
     * 
     * @see         org.red5.server.messaging.IMessage
     */
	public IMessage pullMessage() {
		return pipe.pullMessage();
	}

    /**
     * Pull message with timeout.
     * 
     * @param wait  Timeout
     * 
     * @return      Message object
     * 
     * @see         org.red5.server.messaging.IMessage
     */
	public IMessage pullMessage(long wait) {
		return pipe.pullMessage(wait);
	}

    /**
     * Connect scope's pipe to given consumer.
     * 
     * @param consumer       Consumer
     * @param paramMap       Parameters passed with connection
     * 
     * @return               <code>true</code> on success, <code>false</code> otherwise
     */
	public boolean subscribe(IConsumer consumer, Map paramMap) {
		synchronized (pipe) {
            return !hasRemoved && pipe.subscribe(consumer, paramMap);
        }
	}

    /**
     * Disconnects scope's pipe from given consumer.
     * 
     * @param consumer       Consumer
     * 
     * @return               <code>true</code> on success, <code>false</code> otherwise
     */
	public boolean unsubscribe(IConsumer consumer) {
		return pipe.unsubscribe(consumer);
	}

    /**
     * Getter for pipe consumers.
     * 
     * @return    Pipe consumers
     */
	public List<IConsumer> getConsumers() {
		return pipe.getConsumers();
	}

    /**
     * Send out-of-band ("special") control message.
     * 
     * @param consumer          Consumer, may be used in concrete implementations
     * @param oobCtrlMsg        Out-of-band control message
     */
	public void sendOOBControlMessage(IConsumer consumer, OOBControlMessage oobCtrlMsg) {
		pipe.sendOOBControlMessage(consumer, oobCtrlMsg);
	}

    /**
     * Push a message to this output endpoint. May block
     * the pusher when output can't handle the message at
     * the time.
     * 
     * @param message Message to be pushed.
     * 
     * @throws IOException If message could not be pushed.
     */
	public void pushMessage(IMessage message) throws IOException {
		pipe.pushMessage(message);
	}

    /**
     * Connect scope's pipe with given provider.
     * 
     * @param provider         Provider
     * @param paramMap         Parameters passed on connection
     * 
     * @return                 <code>true</code> on success, <code>false</code> otherwise
     */
    public boolean subscribe(IProvider provider, Map paramMap) {
		synchronized (pipe) {
            return !hasRemoved && pipe.subscribe(provider, paramMap);
        }
	}

    /**
     * Disconnects scope's pipe from given provider.
     * 
     * @param provider         Provider
     * 
     * @return                 <code>true</code> on success, <code>false</code> otherwise
     */
    public synchronized boolean unsubscribe(IProvider provider) {
		return pipe.unsubscribe(provider);
	}

    /**
     * Getter for providers list.
     * 
     * @return    List of providers
     */
	public List<IProvider> getProviders() {
		return pipe.getProviders();
	}

    /**
     * Send out-of-band ("special") control message.
     * 
     * @param provider          Provider, may be used in concrete implementations
     * @param oobCtrlMsg        Out-of-band control message
     */
	public void sendOOBControlMessage(IProvider provider, OOBControlMessage oobCtrlMsg) {
		pipe.sendOOBControlMessage(provider, oobCtrlMsg);
	}

    /**
     * Pipe connection event handler.
     * 
     * @param event              Pipe connection event
     */
	public void onPipeConnectionEvent(PipeConnectionEvent event) {
        // Switch event type
        switch (event.getType()) {
			case PipeConnectionEvent.CONSUMER_CONNECT_PULL:
			case PipeConnectionEvent.CONSUMER_CONNECT_PUSH:
			case PipeConnectionEvent.PROVIDER_CONNECT_PULL:
			case PipeConnectionEvent.PROVIDER_CONNECT_PUSH:
				compCounter++;
				break;

			case PipeConnectionEvent.CONSUMER_DISCONNECT:
			case PipeConnectionEvent.PROVIDER_DISCONNECT:
				compCounter--;
				if (compCounter <= 0) {
					// XXX should we synchronize parent before removing?
					if (hasParent()) {
						IProviderService providerService = (IProviderService) getParent()
								.getContext().getBean(IProviderService.BEAN_NAME);
						providerService.unregisterBroadcastStream(getParent(),
								getName());
					}
					hasRemoved = true;
				}
				break;
			default:
				throw new UnsupportedOperationException("Event type not supported: "+event.getType());
		}
	}

}
