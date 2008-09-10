package org.red5.server.messaging;

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

import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Abstract pipe that books providers/consumers and listeners.
 * Aim to ease the implementation of concrete pipes. For more
 * information on what pipe is, see IPipe interface documentation.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 * @see     org.red5.server.messaging.IPipe
 */
public abstract class AbstractPipe implements IPipe {
    
    /** Logger. */
    private static final Logger log = LoggerFactory.getLogger(AbstractPipe.class);

    /** Pipe consumers list. */
	protected volatile List<IConsumer> consumers = new CopyOnWriteArrayList<IConsumer>();

    /** Pipe providers list. */
	protected volatile List<IProvider> providers = new CopyOnWriteArrayList<IProvider>();

    /** Event listeners. */
	protected volatile List<IPipeConnectionListener> listeners = new CopyOnWriteArrayList<IPipeConnectionListener>();

    /**
     * Connect consumer to this pipe. Doesn't allow to connect one consumer twice.
     * Does register event listeners if instance of IPipeConnectionListener is given.
     * 
     * @param consumer        Consumer
     * @param paramMap        Parameters passed with connection, used in concrete pipe implementations
     * 
     * @return                <code>true</code> if consumer was added, <code>false</code> otherwise
     */
    public boolean subscribe(IConsumer consumer, Map paramMap) {
		// Pipe is possibly used by dozens of Threads at once (like many subscribers for one server stream)
        // so make it synchronized
    	synchronized (consumers) {
            // Can't add one consumer twice
            if (consumers.contains(consumer)) {
				return false;
			}
			consumers.add(consumer);
    	}
        // If consumer is listener object register it as listener
        if (consumer instanceof IPipeConnectionListener) {
			listeners.add((IPipeConnectionListener) consumer);
		}
		return true;
	}

    /**
     * Connect provider to this pipe. Doesn't allow to connect one provider twice.
     * Does register event listeners if instance of IPipeConnectionListener is given.
     * 
     * @param provider        Provider
     * @param paramMap        Parameters passed with connection, used in concrete pipe implementations
     * 
     * @return                <code>true</code> if provider was added, <code>false</code> otherwise
     */
    public boolean subscribe(IProvider provider, Map paramMap) {
        // Shared between possibly dozens of Threads so make it synchronized
    	synchronized (providers) {
			if (providers.contains(provider)) {
				return false;
			}
			providers.add(provider);
    	}
        // Register event listener if given
        if (provider instanceof IPipeConnectionListener) {
			listeners.add((IPipeConnectionListener) provider);
		}
		return true;
	}

    /**
     * Disconnects provider from this pipe. Fires pipe connection event.
     * 
     * @param provider        Provider that should be removed
     * 
     * @return                 <code>true</code> on success, <code>false</code> otherwise
     */
    public boolean unsubscribe(IProvider provider) {
    	if (!providers.remove(provider)) {
    		return false;
    	}
		fireProviderConnectionEvent(provider,
				PipeConnectionEvent.PROVIDER_DISCONNECT, null);
		if (provider instanceof IPipeConnectionListener) {
			listeners.remove(provider);
		}
		return true;
	}

    /**
     * Disconnects consumer from this pipe. Fires pipe connection event.
     * 
     * @param consumer the consumer
     * 
     * @return                 <code>true</code> on success, <code>false</code> otherwise
     */
    public boolean unsubscribe(IConsumer consumer) {
    	if (!consumers.remove(consumer)) {
    		return false;
    	}
		fireConsumerConnectionEvent(consumer,
				PipeConnectionEvent.CONSUMER_DISCONNECT, null);
		if (consumer instanceof IPipeConnectionListener) {
			listeners.remove(consumer);
		}
		return true;
	}

    /**
     * Registers pipe connect events listener.
     * 
     * @param listener      Listener
     */
    public void addPipeConnectionListener(IPipeConnectionListener listener) {
			listeners.add(listener);
		}

    /**
     * Removes pipe connection listener.
     * 
     * @param listener      Listener
     */
    public void removePipeConnectionListener(IPipeConnectionListener listener) {
			listeners.remove(listener);
		}

    /**
     * Send out-of-band ("special") control message to all consumers.
     * 
     * @param provider           Provider, may be used in concrete implementations
     * @param oobCtrlMsg         Out-of-band control message
     */
    public void sendOOBControlMessage(IProvider provider, OOBControlMessage oobCtrlMsg) {
		for (IConsumer consumer : consumers) {
			try {
				consumer.onOOBControlMessage(provider, this, oobCtrlMsg);
			} catch (Throwable t) {
				log
						.error(
								"exception when passing OOBCM from provider to consumers",
								t);
			}
		}
	}

    /**
     * Send out-of-band ("special") control message to all providers.
     * 
     * @param consumer          Consumer, may be used in concrete implementations
     * @param oobCtrlMsg        Out-of-band control message
     */
    public void sendOOBControlMessage(IConsumer consumer,
			OOBControlMessage oobCtrlMsg) {
		for (IProvider provider : providers) {
			try {
				provider.onOOBControlMessage(consumer, this, oobCtrlMsg);
			} catch (Throwable t) {
				log
						.error(
								"exception when passing OOBCM from consumer to providers",
								t);
			}
		}
	}

    /**
     * Getter for pipe connection events listeners.
     * 
     * @return  Listeners
     */
    public List<IPipeConnectionListener> getListeners() {
        return listeners;
    }

    /**
     * Setter for pipe connection events listeners.
     * 
     * @param listeners  Listeners
     */
    public void setListeners(List<IPipeConnectionListener> listeners) {
        this.listeners = listeners;
    }
    
    /**
     * Getter for providers.
     * 
     * @return  Providers list
     */
    public List<IProvider> getProviders() {
		return providers;
	}
    
    /**
     * Getter for consumers.
     * 
     * @return  consumers list
     */
	public List<IConsumer> getConsumers() {
		return consumers;
	}

    /**
     * Broadcast consumer connection event.
     * 
     * @param consumer        Consumer that has connected
     * @param type            Event type
     * @param paramMap        Parameters passed with connection
     */
    protected void fireConsumerConnectionEvent(IConsumer consumer, int type,
			Map paramMap) {
        // Create event object
        PipeConnectionEvent event = new PipeConnectionEvent(this);
        // Fill it up
        event.setConsumer(consumer);
		event.setType(type);
		event.setParamMap(paramMap);
        // Fire it
        firePipeConnectionEvent(event);
	}

    /**
     * Broadcast provider connection event.
     * 
     * @param provider        Provider that has connected
     * @param type            Event type
     * @param paramMap        Parameters passed with connection
     */
    protected void fireProviderConnectionEvent(IProvider provider, int type,
			Map paramMap) {
		PipeConnectionEvent event = new PipeConnectionEvent(this);
		event.setProvider(provider);
		event.setType(type);
		event.setParamMap(paramMap);
		firePipeConnectionEvent(event);
	}

    /**
     * Fire any pipe connection event and run all it's tasks.
     * 
     * @param event            Pipe connection event
     */
    protected void firePipeConnectionEvent(PipeConnectionEvent event) {
		for (IPipeConnectionListener element : listeners) {
			try {
				element.onPipeConnectionEvent(event);
			} catch (Throwable t) {
				log.error("exception when handling pipe connection event", t);
			}
		}

        // Run all of event's tasks
        for (Runnable task : event.getTaskList()) {
			try {
				task.run();
			} catch (Throwable t) {
			}
		}

        // Clear event's tasks list
        event.getTaskList().clear();
	}
}
