package org.red5.server.so;

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

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.locks.ReentrantLock;

import org.red5.server.api.IAttributeStore;
import org.red5.server.api.IConnection;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.event.IEventDispatcher;
import org.red5.server.api.event.IEventListener;
import org.red5.server.api.so.IClientSharedObject;
import org.red5.server.api.so.ISharedObjectListener;
import org.red5.server.net.rtmp.Channel;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.so.ISharedObjectEvent.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Works with client-side shared object.
 */
public class ClientSharedObject extends SharedObject implements
		IClientSharedObject, IEventDispatcher {

    /** Logger. */
    protected static Logger log = LoggerFactory.getLogger(ClientSharedObject.class);
    
    /** Initial synchronization flag. */
	private boolean initialSyncReceived;
    
    /** Synchronization lock. */
    private final ReentrantLock lock = new ReentrantLock();
    
    /** Set of listeners. */
    private Set<ISharedObjectListener> listeners = new CopyOnWriteArraySet<ISharedObjectListener>();
    
    /** Set of event handlers. */
    private Map<String, Object> handlers = new ConcurrentHashMap<String, Object>();

    /**
     * Create new client SO with.
     * 
     * @param name              Shared Object name
     * @param persistent        Persistence flag
     */
    public ClientSharedObject(String name, boolean persistent) {
		super();
		this.name = name;
		persistentSO = persistent;
	}
	
	/**
	 * Connect the shared object using the passed connection.
	 * 
	 * @param conn              Attach SO to given connection
	 */
	public void connect(IConnection conn) {
		if (!(conn instanceof RTMPConnection))
			throw new RuntimeException("can only connect through RTMP connections");
		
		if (isConnected())
			throw new RuntimeException("already connected");
		
		source = conn;
		SharedObjectMessage msg = new SharedObjectMessage(name, 0, isPersistentObject());
		msg.addEvent(new SharedObjectEvent(Type.SERVER_CONNECT, null, null));
		Channel c = ((RTMPConnection) conn).getChannel((byte) 3);
		c.write(msg);
	}
	
	/** {@inheritDoc} */
	public void disconnect() {
		SharedObjectMessage msg = new SharedObjectMessage(name, 0, isPersistentObject());
		msg.addEvent(new SharedObjectEvent(Type.SERVER_DISCONNECT, null, null));
		Channel c = ((RTMPConnection) source).getChannel((byte) 3);
		c.write(msg);
		notifyDisconnect();
		initialSyncReceived = false;
	}
	
	/** {@inheritDoc} */
    public boolean isConnected() {
		return initialSyncReceived;
	}
	
	/** {@inheritDoc} */
    public void addSharedObjectListener(ISharedObjectListener listener) {
		listeners.add(listener);
	}

	/** {@inheritDoc} */
    public void removeSharedObjectListener(ISharedObjectListener listener) {
		listeners.remove(listener);
	}

	/** {@inheritDoc} */
    public void dispatchEvent(IEvent e) {
		if (e.getType() != IEvent.Type.SHARED_OBJECT
				|| !(e instanceof ISharedObjectMessage)) {
			// Don't know how to handle this event.
			return;
		}

		ISharedObjectMessage msg = (ISharedObjectMessage) e;
		if (msg.hasSource()) {
			beginUpdate(msg.getSource());
		} else {
			beginUpdate();
		}
		try {
			for (ISharedObjectEvent event : msg.getEvents()) {
				switch (event.getType()) {
					case CLIENT_INITIAL_DATA:
						initialSyncReceived = true;
						notifyConnect();
						break;
						
					case CLIENT_CLEAR_DATA:
						attributes.clear();
						notifyClear();
						break;
					
					case CLIENT_DELETE_DATA:
					case CLIENT_DELETE_ATTRIBUTE:
						attributes.remove(event.getKey());
						notifyDelete(event.getKey());
						break;
						
					case CLIENT_SEND_MESSAGE:
						notifySendMessage(event.getKey(), (List<?>) event.getValue());
						break;
						
					case CLIENT_UPDATE_DATA:
						attributes.putAll((Map<String, Object>) event.getValue());
						notifyUpdate(event.getKey(), (Map<String, Object>) event.getValue());
						break;
						
					case CLIENT_UPDATE_ATTRIBUTE:
						attributes.put(event.getKey(), event.getValue());
						notifyUpdate(event.getKey(), event.getValue());
						break;
						
					default:
						log.warn("Unknown SO event: " + event.getType());
				}
			}
		} finally {
			endUpdate();
		}
	}

    /**
     * Notify listeners on event.
     */
    protected void notifyConnect() {
        for (ISharedObjectListener listener : listeners) {
            listener.onSharedObjectConnect(this);
        }
    }

    /**
     * Notify listeners on disconnect.
     */
    protected void notifyDisconnect() {
        for (ISharedObjectListener listener : listeners) {
            listener.onSharedObjectDisconnect(this);
        }
    }

    /**
     * Notify listeners on update.
     * 
     * @param key         Updated attribute key
     * @param value       Updated attribute value
     */
    protected void notifyUpdate(String key, Object value) {
        for (ISharedObjectListener listener : listeners) {
            listener.onSharedObjectUpdate(this, key, value);
        }
    }

    /**
     * Notify listeners on map attribute update.
     * 
     * @param key         Updated attribute key
     * @param value       Updated attribute value
     */
    protected void notifyUpdate(String key, Map<String, Object> value) {
		if (value.size() == 1) {
			Map.Entry<String, Object> entry = value.entrySet().iterator().next();
			notifyUpdate(entry.getKey(), entry.getValue());
			return;
		}
        for (ISharedObjectListener listener : listeners) {
            listener.onSharedObjectUpdate(this, key, value);
        }
    }

    /**
     * Notify listeners on attribute delete.
     * 
     * @param key       Attribute name
     */
    protected void notifyDelete(String key) {
        for (ISharedObjectListener listener : listeners) {
            listener.onSharedObjectDelete(this, key);
        }
    }

    /**
     * Notify listeners on clear.
     */
    protected void notifyClear() {
        for (ISharedObjectListener listener : listeners) {
            listener.onSharedObjectClear(this);
        }
    }

    /**
     * Broadcast send event to listeners.
     * 
     * @param method        Method name
     * @param params        Params
     */
    protected void notifySendMessage(String method, List<?> params) {
        for (ISharedObjectListener listener : listeners) {
            listener.onSharedObjectSend(this, method, params);
        }
    }

	/** {@inheritDoc} */
    @Override
	public synchronized boolean setAttribute(String name, Object value) {
    	if (value == null) {
    		return removeAttribute(name);
    	}
    	
		ownerMessage.addEvent(Type.SERVER_SET_ATTRIBUTE, name, value);
		notifyModified();
		return true;
	}

	/** {@inheritDoc} */
    @Override
	public synchronized void setAttributes(IAttributeStore values) {
    	setAttributes(values.getAttributes());
	}

	/** {@inheritDoc} */
    @Override
	public synchronized void setAttributes(Map<String, Object> values) {
		for (Map.Entry<String, Object> entry : values.entrySet()) {
			setAttribute(entry.getKey(), entry.getValue());
		}
	}

	/** {@inheritDoc} */
    @Override
	public synchronized boolean removeAttribute(String name) {
		ownerMessage.addEvent(Type.SERVER_DELETE_ATTRIBUTE, name, null);
		notifyModified();
		return true;
	}

	/** {@inheritDoc} */
    @Override
	public synchronized void sendMessage(String handler, List arguments) {
		ownerMessage.addEvent(Type.SERVER_SEND_MESSAGE, handler, arguments);
		notifyModified();
	}

	/** {@inheritDoc} */
    @Override
	public synchronized void removeAttributes() {
		// TODO: there must be a direct way to clear the SO on the client
		// side...
        for (String key : getAttributeNames()) {
            ownerMessage.addEvent(Type.SERVER_DELETE_ATTRIBUTE, key, null);
        }
        notifyModified();
	}

	/** {@inheritDoc} */
    @Override
	public synchronized boolean clear() {
		return super.clear();
	}

	/** {@inheritDoc} */
    @Override
	public synchronized void close() {
		super.close();
	}

	/** {@inheritDoc} */
    @Override
	public void beginUpdate() {
		lock.lock();
		super.beginUpdate();
	}

	/** {@inheritDoc} */
    @Override
	public void beginUpdate(IEventListener listener) {
		lock.lock();
		super.beginUpdate(listener);
	}

	/** {@inheritDoc} */
    @Override
	public void endUpdate() {
		super.endUpdate();
		lock.unlock();
	}

	/** {@inheritDoc} */
    public void lock() {
		lock.lock();
	}

	/** {@inheritDoc} */
    public void unlock() {
		lock.unlock();
	}

	/** {@inheritDoc} */
    public boolean isLocked() {
		return lock.isLocked();
	}

	/** {@inheritDoc} */
    public void registerServiceHandler(Object handler) {
		registerServiceHandler("", handler);
	}

	/** {@inheritDoc} */
    public void unregisterServiceHandler(String name) {
		handlers.remove(name);
	}

	/** {@inheritDoc} */
    public void registerServiceHandler(String name, Object handler) {
		if (name == null) {
			name = "";
		}
		handlers.put(name, handler);
	}

	/** {@inheritDoc} */
    public Object getServiceHandler(String name) {
		if (name == null) {
			name = "";
		}
		return handlers.get(name);
	}

	/** {@inheritDoc} */
    public Set<String> getServiceHandlerNames() {
		return Collections.unmodifiableSet(handlers.keySet());
	}

	/** {@inheritDoc} */
    public synchronized Object getAttribute(String name, Object defaultValue) {
		if (!hasAttribute(name)) {
			setAttribute(name, defaultValue);
		}

		return getAttribute(name);
	}

}
