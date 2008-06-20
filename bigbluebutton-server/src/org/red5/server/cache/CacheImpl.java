package org.red5.server.cache;

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

import java.lang.ref.SoftReference;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.apache.mina.common.ByteBuffer;
import org.red5.server.api.cache.ICacheStore;
import org.red5.server.api.cache.ICacheable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

// TODO: Auto-generated Javadoc
/**
 * Provides an implementation of an object cache.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class CacheImpl implements ICacheStore, ApplicationContextAware {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(CacheImpl.class);

	/** The instance. */
	private static volatile CacheImpl instance;

	/** The Constant CACHE. */
	private static final Map<String, SoftReference<? extends ICacheable>> CACHE;

	// cache registry - keeps hard references to objects in the cache
	/** The registry. */
	private static Map<String, Integer> registry;

	/** The capacity. */
	private static int capacity = 5;

	/** The cache hit. */
	private static volatile long cacheHit;

	/** The cache miss. */
	private static volatile long cacheMiss;

	static {
		// create an instance
		instance = new CacheImpl();
		// instance a static map with an initial small (prime) size
		CACHE = new HashMap<String, SoftReference<? extends ICacheable>>(3);
		// instance a hard-ref registry
		registry = new HashMap<String, Integer>(3);
	}

	/**
	 * Do not instantiate CacheImpl.
	 */ /*
	 * This constructor helps to ensure that we are singleton.
	 */
	private CacheImpl() {
	}

	// We store the application context in a ThreadLocal so we can access it
	// later.
	/** The application context. */
	private static ApplicationContext applicationContext = null;

	/** {@inheritDoc} */
    public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		CacheImpl.applicationContext = context;
	}

	/**
	 * Getter for property 'applicationContext'.
	 * 
	 * @return Value for property 'applicationContext'.
	 */
    public static ApplicationContext getApplicationContext() {
		return applicationContext;
	}

	/**
	 * Returns the instance of this class.
	 * 
	 * @return the instance
	 */
	public static CacheImpl getInstance() {
		return instance;
	}

	/**
	 * Inits the.
	 */
	public void init() {
		log.info("Loading generic object cache");
		if (log.isDebugEnabled()) {
			log.debug("Appcontext: " + applicationContext.toString());
		}
	}

	/** {@inheritDoc} */
    public Iterator<String> getObjectNames() {
		return Collections.unmodifiableSet(CACHE.keySet()).iterator();
	}

	/** {@inheritDoc} */
    public Iterator<SoftReference<? extends ICacheable>> getObjects() {
		return Collections.unmodifiableCollection(CACHE.values()).iterator();
	}

	/**
	 * Offer.
	 * 
	 * @param key the key
	 * @param obj the obj
	 * 
	 * @return true, if successful
	 */
	public boolean offer(String key, ByteBuffer obj) {
		return offer(key, new CacheableImpl(obj));
	}

	/** {@inheritDoc} */
    public boolean offer(String name, Object obj) {
		boolean accepted = false;
		// check map size
		if (CACHE.size() < capacity) {
			SoftReference tmp = CACHE.get(name);
			// because soft references can be garbage collected when a system is
			// in need of memory, we will check that the cacheable object is
			// valid
			// log.debug("Softreference: " + (null == tmp));
			// if (null != tmp) {
			// log.debug("Softreference value: " + (null == tmp.get()));
			// }
			if (null == tmp || null == tmp.get()) {
				ICacheable cacheable = null;
				if (obj instanceof ICacheable) {
					cacheable = (ICacheable) obj;
				} else {
					cacheable = new CacheableImpl(obj);
				}
				// set the objects name
				cacheable.setName(name);
				// set a registry entry
				registry.put(name, 1);
				// create a soft reference
				SoftReference<ICacheable> value = new SoftReference<ICacheable>(
						cacheable);
				CACHE.put(name, value);
				// set acceptance
				accepted = true;
				log.info(name + " has been added to the cache. Current size: "
						+ CACHE.size());
			}
		} else {
			log.warn("Cache has reached max element size: " + capacity);
		}
		return accepted;
	}

	/** {@inheritDoc} */
    public void put(String name, Object obj) {
		if (obj instanceof ICacheable) {
			put(name, (ICacheable) obj);
		} else {
			put(name, new CacheableImpl(obj));
		}
	}

	/**
	 * Put.
	 * 
	 * @param name the name
	 * @param obj the obj
	 */
	protected void put(String name, ICacheable obj) {
		// set the objects name
		obj.setName(name);
		// set a registry entry
		registry.put(name, 1);
		// create a soft reference
		SoftReference<ICacheable> value = new SoftReference<ICacheable>(obj);
		// put an object into the cache
		CACHE.put(name, value);
		log.info(name + " has been added to the cache. Current size: "
				+ CACHE.size());
	}

	/** {@inheritDoc} */
    public ICacheable get(String name) {
		if (log.isDebugEnabled()) {
			log.debug("Looking up " + name + " in the cache. Current size: " + CACHE.size());
		}
		ICacheable ic = null;
		SoftReference sr = null;
		if (!CACHE.isEmpty() && null != (sr = CACHE.get(name))) {
			ic = (ICacheable) sr.get();
			// add a request count to the registry
			int requestCount = registry.get(name);
			registry.put(name, (requestCount += 1));
			// increment cache hits
			cacheHit += 1;
		} else {
			// add a request count to the registry
			registry.put(name, 1);
			// increment cache misses
			cacheMiss += 1;
		}
		if (log.isDebugEnabled()) {
			log.debug("Registry on get: " + registry.toString());
		}
		return ic;
	}

	/** {@inheritDoc} */
    public boolean remove(ICacheable obj) {
		if (log.isDebugEnabled()) {
			log.debug("Looking up " + obj.getName() + " in the cache. Current size: " + CACHE.size());
		}
		return remove(obj.getName());
	}

	/** {@inheritDoc} */
    public boolean remove(String name) {
		return CACHE.remove(name) != null ? true : false;
	}

	/**
	 * Getter for property 'cacheHit'.
	 * 
	 * @return Value for property 'cacheHit'.
	 */
    public static long getCacheHit() {
		return cacheHit;
	}

	/**
	 * Getter for property 'cacheMiss'.
	 * 
	 * @return Value for property 'cacheMiss'.
	 */
    public static long getCacheMiss() {
		return cacheMiss;
	}

	/** {@inheritDoc} */
    public void setMaxEntries(int max) {
		log.info("Setting max entries for this cache to " + max);
		CacheImpl.capacity = max;
	}

	/** {@inheritDoc} */
    public void destroy() {
		// Shut down the cache manager
		try {
			registry.clear();
			registry = null;
			CACHE.clear();
		} catch (Exception e) {
			log.warn("Error on cache shutdown", e);
		}
	}
}
