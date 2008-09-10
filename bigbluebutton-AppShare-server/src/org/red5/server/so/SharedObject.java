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

import static org.red5.server.api.so.ISharedObject.TYPE;

import java.io.IOException;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.atomic.AtomicInteger;

import org.red5.io.object.Deserializer;
import org.red5.io.object.Input;
import org.red5.io.object.Output;
import org.red5.io.object.Serializer;
import org.red5.server.AttributeStore;
import org.red5.server.api.IAttributeStore;
import org.red5.server.api.event.IEventListener;
import org.red5.server.api.persistence.IPersistable;
import org.red5.server.api.persistence.IPersistenceStore;
import org.red5.server.api.statistics.ISharedObjectStatistics;
import org.red5.server.api.statistics.support.StatisticsCounter;
import org.red5.server.net.rtmp.Channel;
import org.red5.server.net.rtmp.RTMPConnection;
import org.red5.server.net.rtmp.message.Constants;
import org.red5.server.so.ISharedObjectEvent.Type;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Represents shared object on server-side. Shared Objects in Flash are like cookies that are stored
 * on client side. In Red5 and Flash Media Server there's one more special type of SOs : remote Shared Objects.
 * 
 * These are shared by multiple clients and synchronized between them automatically on each data change. This is done
 * asynchronously, used as events handling and is widely used in multiplayer Flash online games.
 * 
 * Shared object can be persistent or transient. The difference is that first are saved to the disk and can be
 * accessed later on next connection, transient objects are not saved and get lost each time they last client
 * disconnects from it.
 * 
 * Shared Objects has name identifiers and path on server's HD (if persistent). On deeper level server-side
 * Shared Object in this implementation actually uses IPersistenceStore to delegate all (de)serialization work.
 * 
 * SOs store data as simple map, that is, "name-value" pairs. Each value in turn can be complex object or map.
 * 
 * All access to methods that change properties in the SO must be properly
 * synchronized for multi-threaded access.
 */
public class SharedObject extends AttributeStore implements ISharedObjectStatistics, IPersistable, Constants {
    
    /** Logger. */
	protected static Logger log = LoggerFactory.getLogger(SharedObject.class);

    /** Shared Object name (identifier). */
    protected String name = "";

    /** SO path. */
    protected String path = "";

    /** true if the SharedObject was stored by the persistence framework (NOT in database, just plain serialization to the disk) and can be used later on reconnection. */

	protected boolean persistent;

    /** true if the client / server created the SO to be persistent. */
	protected boolean persistentSO;

    /** Object that is delegated with all storage work for persistent SOs. */
    protected IPersistenceStore storage;

    /** Version. Used on synchronization purposes. */
    protected int version = 1;

    /** Number of pending update operations. */
    protected int updateCounter;

    /** Has changes? flag. */
    protected boolean modified;

    /** Last modified timestamp. */
    protected long lastModified = -1;

    /** Owner event. */
    protected SharedObjectMessage ownerMessage;

    /** Synchronization events. */
    protected LinkedList<ISharedObjectEvent> syncEvents = new LinkedList<ISharedObjectEvent>();

    /** Listeners. */
    protected Set<IEventListener> listeners = new CopyOnWriteArraySet<IEventListener>();

    /** Event listener, actually RTMP connection. */
    protected IEventListener source;
    
    /** Number of times the SO has been acquired. */
    protected int acquireCount;

	/** Timestamp the scope was created. */
	private long creationTime;
	
    /** Manages listener statistics. */
    protected StatisticsCounter listenerStats = new StatisticsCounter(); 
    
    /** Counts number of "change" events. */
    protected AtomicInteger changeStats = new AtomicInteger();
    
    /** Counts number of "delete" events. */
    protected AtomicInteger deleteStats = new AtomicInteger();
    
    /** Counts number of "send message" events. */
    protected AtomicInteger sendStats = new AtomicInteger();
    
	/**
	 * Constructs a new SharedObject.
	 */
    public SharedObject() {
		// This is used by the persistence framework
        super();

		ownerMessage = new SharedObjectMessage(null, null, -1, false);
        persistentSO = false;
        creationTime = System.currentTimeMillis();
    }

    /**
     * Constructs new SO from Input object.
     * 
     * @param input              Input source
     * 
     * @throws IOException       I/O exception
     * 
     * @see org.red5.io.object.Input
     */
    public SharedObject(Input input) throws IOException {
		this();
		deserialize(input);
	}

    /**
     * Creates new SO from given data map, name, path and persistence option.
     * 
     * @param data               Data
     * @param name               SO name
     * @param path               SO path
     * @param persistent         SO persistence
     */
    public SharedObject(Map<String, Object> data, String name, String path,
			boolean persistent) {
    	super();
		this.name = name;
		this.path = path;
        persistentSO = false;
        this.persistentSO = persistent;

		ownerMessage = new SharedObjectMessage(null, name, 0, persistent);
        creationTime = System.currentTimeMillis();
        super.setAttributes(data);
	}

    /**
     * Creates new SO from given data map, name, path, storage object and persistence option.
     * 
     * @param data               Data
     * @param name               SO name
     * @param path               SO path
     * @param persistent         SO persistence
     * @param storage            Persistence storage
     */
    public SharedObject(Map<String, Object> data, String name, String path,
			boolean persistent, IPersistenceStore storage) {
    	this(data, name, path, persistent);
		setStore(storage);
	}

	/** {@inheritDoc} */
    public String getName() {
		return name;
	}

	/** {@inheritDoc} */
    public void setName(String name) {
		// Shared objects don't support setting of their names
	}

	/** {@inheritDoc} */
    public String getPath() {
		return path;
	}

	/** {@inheritDoc} */
    public void setPath(String path) {
		this.path = path;
	}

	/** {@inheritDoc} */
    public String getType() {
		return TYPE;
	}

	/** {@inheritDoc} */
    public long getLastModified() {
		return lastModified;
	}

	/**
	 * Getter for persistent object.
	 * 
	 * @return  Persistent object
	 */
    public boolean isPersistentObject() {
		return persistentSO;
	}

	/** {@inheritDoc} */
    public boolean isPersistent() {
		return persistent;
	}

	/** {@inheritDoc} */
    public void setPersistent(boolean persistent) {
		this.persistent = persistent;
	}

    /**
     * Send update notification over data channel of RTMP connection.
     */
    protected void sendUpdates() {
		if (!ownerMessage.getEvents().isEmpty()) {
			// Send update to "owner" of this update request
			SharedObjectMessage syncOwner = new SharedObjectMessage(null, name,
					version, isPersistentObject());
			syncOwner.addEvents(ownerMessage.getEvents());

			if (source != null) {
				// Only send updates when issued through RTMP request
				Channel channel = ((RTMPConnection) source)
						.getChannel((byte) 3);

				if (channel != null) {
					//ownerMessage.acquire();

					channel.write(syncOwner);
					log.debug("Owner: " + channel);
				} else {
					log.warn("No channel found for owner changes!?");
				}
			}
			ownerMessage.getEvents().clear();
		}
		
		if (!syncEvents.isEmpty()) {
			// Synchronize updates with all registered clients of this shared

			for (IEventListener listener : listeners) {

				if (listener == source) {
					// Don't re-send update to active client
					log.debug("Skipped " + source);
					continue;
				}

				if (!(listener instanceof RTMPConnection)) {
					log.warn("Can't send sync message to unknown connection "
							+ listener);
					continue;
				}

				// Create a new sync message for every client to avoid
				// concurrent access through multiple threads
				// TODO: perhaps we could cache the generated message
				SharedObjectMessage syncMessage = new SharedObjectMessage(null,
						name, version, isPersistentObject());
				syncMessage.addEvents(syncEvents);

				Channel c = ((RTMPConnection) listener).getChannel((byte) 3);
				log.debug("Send to " + c);
				c.write(syncMessage);
			}
			// Clear list of sync events
			syncEvents.clear();
		}
	}

    /**
     * Send notification about modification of SO.
     */
    protected void notifyModified() {
		if (updateCounter > 0) {
			// we're inside a beginUpdate...endUpdate block
			return;
		}

		if (modified) {
			// The client sent at least one update -> increase version of SO
			updateVersion();
			lastModified = System.currentTimeMillis();
		}

		if (modified && storage != null) {
			if (!storage.save(this)) {
				log.error("Could not store shared object.");
			}
		}

		sendUpdates();
	}

    /**
     * Return an error message to the client.
     * 
     * @param message the message
     */
    protected void returnError(String message) {
		ownerMessage.addEvent(Type.CLIENT_STATUS, "error", message);
    }
    
    /**
     * Return an attribute value to the owner.
     * 
     * @param name the name
     */
    protected void returnAttributeValue(String name) {
		ownerMessage.addEvent(Type.CLIENT_UPDATE_DATA, name, getAttribute(name));
    }
    
    /**
     * Return attribute by name and set if it doesn't exist yet.
     * 
     * @param name         Attribute name
     * @param value        Value to set if attribute doesn't exist
     * 
     * @return             Attribute value
     */
    @Override
    public Object getAttribute(String name, Object value) {
    	if (name == null) {
    		return null;
    	}
    	
    	Object result = attributes.putIfAbsent(name, value);
    	if (result == null) {
    		// No previous value
			modified = true;
    		ownerMessage.addEvent(Type.CLIENT_UPDATE_DATA, name, value);
    		syncEvents.add(new SharedObjectEvent(Type.CLIENT_UPDATE_DATA, name, value));
    		notifyModified();
			changeStats.incrementAndGet();
    		result = value;
    	}
    	
		return result;
	}

    /**
     * Set value of attribute with given name.
     * 
     * @param name         Attribute name
     * @param value        Attribute value
     * 
     * @return             <code>true</code> if there's such attribute and value was set, <code>false</code> otherwise
     */
    @Override
    public boolean setAttribute(String name, Object value) {
		ownerMessage.addEvent(Type.CLIENT_UPDATE_ATTRIBUTE, name, null);
		if (value == null && super.removeAttribute(name)) {
			// Setting a null value removes the attribute
			modified = true;
			syncEvents.add(new SharedObjectEvent(Type.CLIENT_DELETE_DATA, name,
					null));
			deleteStats.incrementAndGet();
			notifyModified();
			return true;
		} else if (value != null && super.setAttribute(name, value)) {
			// only sync if the attribute changed
			modified = true;
			syncEvents.add(new SharedObjectEvent(Type.CLIENT_UPDATE_DATA, name,
					value));
			notifyModified();
			changeStats.incrementAndGet();
			return true;
		} else {
			notifyModified();
			return false;
		}
	}

	/**
	 * Set attributes as map.
	 * 
	 * @param values  Attributes.
	 */
    @Override
    public void setAttributes(Map<String, Object> values) {
		if (values == null) {
			return;
		}

		beginUpdate();
		try {
			for (Map.Entry<String, Object> entry : values.entrySet()) {
				setAttribute(entry.getKey(), entry.getValue());
			}
		} finally {
			endUpdate();
		}
	}

	/**
	 * Set attributes as attributes store.
	 * 
	 * @param values  Attributes.
	 */
    @Override
    public void setAttributes(IAttributeStore values) {
		if (values == null) {
			return;
		}

		setAttributes(values.getAttributes());
	}

    /**
     * Removes attribute with given name.
     * 
     * @param name    Attribute
     * 
     * @return        <code>true</code> if there's such an attribute and it was removed, <code>false</code> otherwise
     */
    @Override
    public boolean removeAttribute(String name) {
		// Send confirmation to client
		ownerMessage.addEvent(Type.CLIENT_DELETE_DATA, name, null);
    	if (super.removeAttribute(name)) {
			modified = true;
			syncEvents.add(new SharedObjectEvent(Type.CLIENT_DELETE_DATA, name,
					null));
			deleteStats.incrementAndGet();
			notifyModified();
			return true;
		} else {
			notifyModified();
			return false;
		}
	}

    /**
     * Broadcast event to event handler.
     * 
     * @param handler         Event handler
     * @param arguments       Arguments
     */
    protected void sendMessage(String handler, List<?> arguments) {
        // Forward
        ownerMessage.addEvent(Type.CLIENT_SEND_MESSAGE, handler, arguments);
		syncEvents.add(new SharedObjectEvent(Type.CLIENT_SEND_MESSAGE, handler,
				arguments));
		sendStats.incrementAndGet();
	}

	/**
	 * Getter for data.
	 * 
	 * @return  SO data as unmodifiable map
	 */
    public Map<String, Object> getData() {
		return getAttributes();
	}

	/**
	 * Getter for version.
	 * 
	 * @return  SO version.
	 */
    public int getVersion() {
		return version;
	}

    /**
     * Increases version by one.
     */
	private void updateVersion() {
		version += 1;
	}

    /**
     * Remove all attributes (clear Shared Object).
     */
	@Override
	public void removeAttributes() {
		// TODO: there must be a direct way to clear the SO on the client side...
		Set<String> names = getAttributeNames();
        for (String key : names) {
            ownerMessage.addEvent(Type.CLIENT_DELETE_DATA, key, null);
            syncEvents.add(new SharedObjectEvent(Type.CLIENT_DELETE_DATA, key,
                    null));
        }
		deleteStats.addAndGet(names.size());
        // Clear data
		super.removeAttributes();
        // Mark as modified
        modified = true;
        // Broadcast 'modified' event
        notifyModified();
	}

    /**
     * Register event listener.
     * 
     * @param listener        Event listener
     */
	protected void register(IEventListener listener) {
		listeners.add(listener);
		listenerStats.increment();

		// prepare response for new client
		ownerMessage.addEvent(Type.CLIENT_INITIAL_DATA, null, null);
		if (!isPersistentObject()) {
			ownerMessage.addEvent(Type.CLIENT_CLEAR_DATA, null, null);
		}
		if (!attributes.isEmpty()) {
			ownerMessage.addEvent(new SharedObjectEvent(
					Type.CLIENT_UPDATE_DATA, null, getAttributes()));
		}

		// we call notifyModified here to send response if we're not in a
		// beginUpdate block
		notifyModified();
	}

    /**
     * Check if shared object must be released.
     */
    protected void checkRelease() {
		if (!isPersistentObject() && listeners.isEmpty() && !isAcquired()) {
			log.info("Deleting shared object " + name
					+ " because all clients disconnected and it is no longer acquired.");
			if (storage != null) {
				if (!storage.remove(this)) {
					log.error("Could not remove shared object.");
				}
			}
			close();
		}
    }
    
    /**
     * Unregister event listener.
     * 
     * @param listener        Event listener
     */
    protected void unregister(IEventListener listener) {
		listeners.remove(listener);
		listenerStats.decrement();
		checkRelease();
	}

	/**
	 * Get event listeners.
	 * 
	 * @return Value for property 'listeners'.
	 */
    public Set<IEventListener> getListeners() {
		return listeners;
	}

    /**
     * Begin update of this Shared Object.
     * Increases number of pending update operations
     */
    protected void beginUpdate() {
		beginUpdate(source);
	}

    /**
     * Begin update of this Shared Object and setting listener.
     * 
     * @param listener      Update with listener
     */
    protected void beginUpdate(IEventListener listener) {
		source = listener;
        // Increase number of pending updates
        updateCounter += 1;
	}

    /**
     * End update of this Shared Object. Decreases number of pending update operations and
     * broadcasts modified event if it is equal to zero (i.e. no more pending update operations).
     */
    protected void endUpdate() {
        // Decrease number of pending updates
        updateCounter -= 1;

        // If
        if (updateCounter == 0) {
			notifyModified();
			source = null;
		}
	}

	/** {@inheritDoc} */
    public void serialize(Output output) throws IOException {
		Serializer ser = new Serializer();
		ser.serialize(output, getName());
		ser.serialize(output, getAttributes());
	}

	/** {@inheritDoc} */
    @SuppressWarnings("unchecked")
    public void deserialize(Input input) throws IOException {
		Deserializer deserializer = new Deserializer();
		name = deserializer.deserialize(input, String.class);
		persistentSO = persistent = true;
		super.setAttributes(deserializer.deserialize(input, Map.class));
		ownerMessage.setName(name);
		ownerMessage.setIsPersistent(true);
	}

	/** {@inheritDoc} */
    public void setStore(IPersistenceStore store) {
		this.storage = store;
	}

	/** {@inheritDoc} */
    public IPersistenceStore getStore() {
		return storage;
	}

	/**
	 * Deletes all the attributes and sends a clear event to all listeners. The
	 * persistent data object is also removed from a persistent shared object.
	 * 
	 * @return <code>true</code> on success, <code>false</code> otherwise
	 */
    protected boolean clear() {
    	super.removeAttributes();
		// Send confirmation to client
		ownerMessage.addEvent(Type.CLIENT_CLEAR_DATA, name, null);
		notifyModified();
		changeStats.incrementAndGet();
        // Is it clear now?
        return true;
	}

	/**
	 * Detaches a reference from this shared object, reset it's state, this will destroy the
	 * reference immediately. This is useful when you don't want to proxy a
	 * shared object any longer.
	 */
    protected void close() {
		// clear collections
		super.removeAttributes();
		listeners.clear();
		syncEvents.clear();
		ownerMessage.getEvents().clear();
	}

	/**
	 * Prevent shared object from being released. Each call to <code>acquire</code>
	 * must be paired with a call to <code>release</code> so the SO isn't held
	 * forever. This is only valid for non-persistent SOs.
	 */
	public synchronized void acquire() {
		acquireCount++;
	}
	
	/**
	 * Check if shared object currently is acquired.
	 * 
	 * @return <code>true</code> if the SO is acquired, otherwise <code>false</code>
	 */
	public boolean isAcquired() {
		return acquireCount > 0;
	}
	
	/**
	 * Release previously acquired shared object. If the SO is non-persistent,
	 * no more clients are connected the SO isn't acquired any more, the data
	 * is released.
	 */
	public synchronized void release() {
		if (acquireCount == 0)
			throw new RuntimeException("The shared object was not acquired before.");
		
		acquireCount--;
		if (acquireCount == 0)
			checkRelease();
	}
	
	/** {@inheritDoc} */
	public long getCreationTime() {
		return creationTime;
	}
	
	/** {@inheritDoc} */
	public int getTotalListeners() {
		return listenerStats.getTotal();
	}
	
	/** {@inheritDoc} */
	public int getMaxListeners() {
		return listenerStats.getMax();
	}
	
	/** {@inheritDoc} */
	public int getActiveListeners() {
		return listenerStats.getCurrent();
	}
	
	/** {@inheritDoc} */
	public int getTotalChanges() {
		return changeStats.intValue();
	}
	
	/** {@inheritDoc} */
	public int getTotalDeletes() {
		return deleteStats.intValue();
	}
	
	/** {@inheritDoc} */
	public int getTotalSends() {
		return sendStats.intValue();
	}

}
