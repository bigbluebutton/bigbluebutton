package org.red5.server.persistence;

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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;

import org.red5.server.api.persistence.IPersistable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Thread that writes modified persistent objects to the file system
 * periodically.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class FilePersistenceThread implements Runnable {

	/** Logger. */
	private Logger log = LoggerFactory.getLogger(FilePersistenceThread.class);

	/** Interval to serialize modified objects in milliseconds. */
	// TODO: make this configurable
	private long storeInterval = 10000;

	/** Modified objects. */
	private Map<UpdateEntry, FilePersistence> objects = new ConcurrentHashMap<UpdateEntry, FilePersistence>();

	/** Singleton instance. */
	private static volatile FilePersistenceThread instance = null;

	/** Each FilePersistenceThread has its own scheduler and the executor is guaranteed to only run a single task at a time. */
	private final ScheduledExecutorService scheduler = Executors
			.newSingleThreadScheduledExecutor();

	/**
	 * Return singleton instance of the thread.
	 * 
	 * @return the instance
	 */
	public static FilePersistenceThread getInstance() {
		return instance;
	}

	/**
	 * Create instance of the thread.
	 */
	private FilePersistenceThread() {
		super();
		if (instance != null) {
			log.error("Instance was not null, this is not a good sign");
		}
		instance = this;
		final ScheduledFuture<?> instanceHandle = scheduler
				.scheduleAtFixedRate(this, storeInterval, storeInterval,
						java.util.concurrent.TimeUnit.MILLISECONDS);
	}

	/**
	 * Notify thread that an object was modified in a persistence store.
	 * 
	 * @param object the object
	 * @param store the store
	 */
	protected void modified(IPersistable object, FilePersistence store) {
		FilePersistence previous = objects.put(new UpdateEntry(object, store), store);
		if (previous != null && !previous.equals(store)) {
			log.warn("Object {} was also modified in {}, saving instantly",
					new Object[] { object, previous });
			previous.saveObject(object);
		}
	}

	/**
	 * Write any pending objects for the given store to disk.
	 * 
	 * @param store the store
	 */
	protected void notifyClose(FilePersistence store) {
		// Store pending objects for this store
		for (UpdateEntry entry : objects.keySet()) {
			if (!store.equals(entry.store)) {
				// Object is from different store
				continue;
			}
			
			try {
				objects.remove(entry);
				store.saveObject(entry.object);
			} catch (Throwable e) {
				log.error("Error while saving {} in {}. {}", new Object[] {
						entry.object, store, e });
			}
		}
	}

	/**
	 * Write modified objects to the file system periodically.
	 */
	public void run() {
		if (objects.isEmpty()) {
			// No objects to store
			return;
		}
		
		for (UpdateEntry entry : objects.keySet()) {
			try {
				objects.remove(entry);
				entry.store.saveObject(entry.object);
			} catch (Throwable e) {
				log.error("Error while saving {} in {}. {}", new Object[] {
						entry.object, entry.store, e });
			}
		}
	}

	/**
	 * Cleanly shutdown the tasks.
	 */
	public void shutdown() {
		scheduler.shutdown();
	}

	/**
	 * Informations about one entry to object.
	 */
	private class UpdateEntry {
		
		/** Object to store. */
		IPersistable object;
		
		/** Store the object should be serialized to. */
		FilePersistence store;
		
		/**
		 * Create new update entry.
		 * 
		 * @param object object to serialize
		 * @param store 	store the object should be serialized in
		 */
		UpdateEntry(IPersistable object, FilePersistence store) {
			this.object = object;
			this.store = store;
		}
		
		/**
		 * Compare with another entry.
		 * 
		 * @param other 	entry to compare to
		 * 
		 * @return <code>true</code> if entries match, otherwise <code>false</code>
		 */
		@Override
		public boolean equals(Object other) {
			if (!(other instanceof UpdateEntry)) {
				return false;
			}
			
			return (object.equals(((UpdateEntry) other).object) && store.equals(((UpdateEntry) other).store));
		}
		
		/**
		 * Return hash value for entry.
		 * 
		 * @return the hash value
		 */
		@Override
		public int hashCode() {
			return object.hashCode() + store.hashCode();
		}
		
	}
	
}
