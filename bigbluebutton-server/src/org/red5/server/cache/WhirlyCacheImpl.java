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
import java.util.Iterator;

import org.red5.server.api.cache.ICacheStore;
import org.red5.server.api.cache.ICacheable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

import com.whirlycott.cache.Cache;
import com.whirlycott.cache.CacheConfiguration;
import com.whirlycott.cache.CacheManager;
import com.whirlycott.cache.RecordKeeper;

// TODO: Auto-generated Javadoc
/**
 * Provides an implementation of an object cache using whirlycache.
 * 
 * @see <a href="https://whirlycache.dev.java.net/">whirlycache homepage</a>
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class WhirlyCacheImpl implements ICacheStore, ApplicationContextAware {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(WhirlyCacheImpl.class);

	/** The cache. */
	private static Cache cache;

	/** The cache config. */
	private CacheConfiguration cacheConfig;

	// We store the application context in a ThreadLocal so we can access it
	// later.
	/** The application context. */
	private static ApplicationContext applicationContext;

	/** {@inheritDoc} */
    public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		WhirlyCacheImpl.applicationContext = context;
	}
	
	/**
	 * Returns Spring application context used by this class.
	 * 
	 * @return Spring application context object
	 */
	public static ApplicationContext getApplicationContext() {
		return applicationContext;
	}
	
	/**
	 * Initialazing method.
	 */
	public void init() {
		log.info("Loading whirlycache");
		// log.debug("Appcontext: " + applicationContext.toString());
		try {
			// instance the manager
			CacheManager cm = CacheManager.getInstance();
			// get the default cache that is created when a config file is not
			// found - we want to wire ours via Spring
			for (String nm : cm.getCacheNames()) {
				if (log.isDebugEnabled()) {
					log.debug("Cache name: " + nm);
				}
				if (nm.equals("default")) {
					// destroy the default cache
					cm.destroy("default");
				}
			}
			// Use the cache manager to create our cache
			cache = cm.createCache(cacheConfig);
		} catch (Exception e) {
			log.warn("Error on cache init", e);
		}
	}
	
	/**
	 * Returns cachable object by name.
	 * 
	 * @param name Object name
	 * 
	 * @return the i cacheable
	 */
	public ICacheable get(String name) {
		return (ICacheable) cache.retrieve(name);
	}
	
	/**
	 * Puts object in cache under given name, overloaded method.
	 * 
	 * @param name Name
	 * @param obj 	Object to store in cache
	 */
	public void put(String name, Object obj) {
		// Put an object into the cache
		if (obj instanceof ICacheable) {
			cache.store(name, obj);
		} else {
			cache.store(name, new CacheableImpl(obj));
		}
	}
	
	/**
	 * Iterate thru names of objects in cache. To be implemented!
	 * 
	 * @return 	Iterator
	 */
	public Iterator<String> getObjectNames() {
		// TODO Auto-generated method stub
		return null;
	}
	
	/**
	 * Iterate thru names of objects in cache with soft reference. To be implemented!
	 * 
	 * @return the objects
	 */
	public Iterator<SoftReference<? extends ICacheable>> getObjects() {
		// TODO Auto-generated method stub
		return null;
	}
	
	/**
	 * Stores object in the cache.
	 * 
	 * @param name Name of stored object
	 * @param obj 	Object to store
	 * 
	 * @return true, if offer
	 */
	public boolean offer(String name, Object obj) {
		// Put an object into the cache
		cache.store(name, obj);
		// almost always returns true because store does not return a status
		return true;
	}
	
	/**
	 * Removes object from cache.
	 * 
	 * @param obj 	Object to remove from cache
	 * 
	 * @return true, if removes the
	 */
	public boolean remove(ICacheable obj) {
		return (null != cache.remove(obj.getName()));
	}
	
	/**
	 * Removes object from cache by name.
	 * 
	 * @param name Name of object to remove
	 * 
	 * @return true, if removes the
	 */
	public boolean remove(String name) {
		return (null != cache.remove(name));
	}
	
	/**
	 * Sets cache configuration.
	 * 
	 * @param cacheConfig Cache configuration
	 */
	public void setCacheConfig(CacheConfiguration cacheConfig) {
		this.cacheConfig = cacheConfig;
	}
	
	/* (non-Javadoc)
	 * @see org.red5.server.api.cache.ICacheStore#setMaxEntries(int)
	 */
	public void setMaxEntries(int capacity) {
		if (log.isDebugEnabled()) {
			log.debug("Setting max entries for this cache to " + capacity);
		}
	}
	
	/**
	 * Returns cache hits stats.
	 * 
	 * @return cache hits stats
	 */
	public static long getCacheHit() {
		RecordKeeper rec = new RecordKeeper();
		return rec.getHits();
	}
	
	/**
	 * Returns cache misses stats.
	 * 
	 * @return cache misses stats
	 */
	public static long getCacheMiss() {
		long misses = 0;
		RecordKeeper rec = new RecordKeeper();
		long hits = rec.getHits();		
		long ops = rec.getTotalOperations();
		if (log.isDebugEnabled()) {
			log.debug("Hits: " + hits + " Operations: " + ops);
		}
		if (hits > 0 && ops > 0) {
			if (ops > hits) {
				misses = ops - hits;
			} else {
				misses = hits - ops;
			}
		} else {
			if (hits < 0 && ops > 0) {
				misses = ops;
			}
		}
		return misses;
	}	
	
	/**
	 * Shuts cache manager down.
	 */
	public void destroy() {
		// Shut down the cache manager
		try {
			CacheManager.getInstance().shutdown();
		} catch (Exception e) {
			log.warn("Error on cache shutdown", e);
		}
	}
}
