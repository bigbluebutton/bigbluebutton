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
import java.util.List;
import java.util.Set;

import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Ehcache;
import net.sf.ehcache.Element;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.config.Configuration;
import net.sf.ehcache.config.ConfigurationHelper;
import net.sf.ehcache.event.CacheManagerEventListener;

import org.red5.server.api.cache.ICacheStore;
import org.red5.server.api.cache.ICacheable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;

// TODO: Auto-generated Javadoc
/**
 * Provides an implementation of an object cache using EhCache.
 * 
 * @see <a href="http://ehcache.sourceforge.net/">ehcache homepage</a>
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class EhCacheImpl implements ICacheStore, ApplicationContextAware {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(EhCacheImpl.class);

	/** The cache. */
	private static Ehcache cache;

	/** The configs. */
	private List<CacheConfiguration> configs;
	
	/** The memory store eviction policy. */
	private String memoryStoreEvictionPolicy = "LRU";
	
	/** The disk expiry thread interval seconds. */
	private int diskExpiryThreadIntervalSeconds = 120;
	
	/** The disk store. */
	private String diskStore = System.getProperty("java.io.tmpdir");
	
	/** The cache manager event listener. */
	private CacheManagerEventListener cacheManagerEventListener;

	// We store the application context in a ThreadLocal so we can access it
	// later.
	/** The application context. */
	private static ApplicationContext applicationContext;

	/** {@inheritDoc} */
    public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		EhCacheImpl.applicationContext = context;
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
	 * Inits the.
	 */
	public void init() {
		log.info("Loading ehcache");
		// log.debug("Appcontext: " + applicationContext.toString());
		try {
			// instance the manager
			CacheManager cm = CacheManager.getInstance();
			// Use the Configuration to create our caches
			Configuration configuration = new Configuration();
			//set initial default cache name
			String defaultCacheName = Cache.DEFAULT_CACHE_NAME;
			//add the configs to a configuration
			for (CacheConfiguration conf : configs) {
				//set disk expiry
				conf.setDiskExpiryThreadIntervalSeconds(diskExpiryThreadIntervalSeconds);
				//set eviction policy
				conf.setMemoryStoreEvictionPolicy(memoryStoreEvictionPolicy);
				if (null == cache) {
					//get first cache name and use as default
					defaultCacheName = conf.getName();
					configuration.addDefaultCache(conf);
				} else {
					configuration.addCache(conf);
				}
			}
			//instance the helper
			ConfigurationHelper helper = new ConfigurationHelper(cm, configuration);
			//create the default cache
			cache = helper.createDefaultCache();
			//init the default
			cache.initialise();
			cache.bootstrap();			
			//create the un-init'd caches
			Set<Cache> caches = helper.createCaches();
			if (log.isDebugEnabled()) {
				log.debug("Number of caches: " + caches.size() + " Default cache: " + (cache != null ? 1 : 0));
			}
			for (Cache cache : caches) {
				cache.initialise();
				cache.bootstrap();
				//set first cache to be main local member
				if (null == cache) {
					if (log.isDebugEnabled()) {
						log.debug("Default cache name: " + defaultCacheName);
					}
					cache = cm.getCache(defaultCacheName);
				}
			}
		} catch (Exception e) {
			log.warn("Error on cache init", e);
		}
		if (log.isDebugEnabled()) {
			log.debug("Cache is null? " + (null == cache));
		}
	}

	/** {@inheritDoc} */
    public ICacheable get(String name) {
		ICacheable ic = null;
		try {
			ic = (ICacheable) cache.get(name).getObjectValue();
		} catch (NullPointerException npe) {
		}
		return ic;
	}

	/** {@inheritDoc} */
    public void put(String name, Object obj) {
		if (obj instanceof ICacheable) {
			cache.put(new Element(name, obj));
		} else {
			cache.put(new Element(name, new CacheableImpl(obj)));
		}
	}

	/** {@inheritDoc} */
    public Iterator<String> getObjectNames() {
		return cache.getKeys().iterator();
	}

	/** {@inheritDoc} */
    public Iterator<SoftReference<? extends ICacheable>> getObjects() {
		return null;
	}

	/** {@inheritDoc} */
    public boolean offer(String name, Object obj) {
		boolean result = false;
		try {
			result = cache.isKeyInCache(name);
			// Put an object into the cache
			if (!result) {
				put(name, obj);
			}
			//check again
			result = cache.isKeyInCache(name);
		} catch(NullPointerException npe) {
			log.debug("Name: " + name + " Object: " + obj.getClass().getName(), npe);
		}
		return result;
	}

	/** {@inheritDoc} */
    public boolean remove(ICacheable obj) {
		return cache.remove(obj.getName());
	}

	/** {@inheritDoc} */
    public boolean remove(String name) {
		return cache.remove(name);
	}

	/**
	 * Setter for property 'cacheConfigs'.
	 * 
	 * @param configs Value to set for property 'cacheConfigs'.
	 */
    public void setCacheConfigs(List<CacheConfiguration> configs) {
		this.configs = configs;
	}

	/** {@inheritDoc} */
    public void setMaxEntries(int capacity) {
		if (log.isDebugEnabled()) {
			log.debug("Setting max entries for this cache to " + capacity);
		}
	}

	/**
	 * Getter for property 'memoryStoreEvictionPolicy'.
	 * 
	 * @return Value for property 'memoryStoreEvictionPolicy'.
	 */
    public String getMemoryStoreEvictionPolicy() {
		return memoryStoreEvictionPolicy;
	}

	/**
	 * Setter for property 'memoryStoreEvictionPolicy'.
	 * 
	 * @param memoryStoreEvictionPolicy Value to set for property 'memoryStoreEvictionPolicy'.
	 */
    public void setMemoryStoreEvictionPolicy(String memoryStoreEvictionPolicy) {
		this.memoryStoreEvictionPolicy = memoryStoreEvictionPolicy;
	}

	/**
	 * Getter for property 'diskExpiryThreadIntervalSeconds'.
	 * 
	 * @return Value for property 'diskExpiryThreadIntervalSeconds'.
	 */
    public int getDiskExpiryThreadIntervalSeconds() {
		return diskExpiryThreadIntervalSeconds;
	}

	/**
	 * Setter for property 'diskExpiryThreadIntervalSeconds'.
	 * 
	 * @param diskExpiryThreadIntervalSeconds Value to set for property 'diskExpiryThreadIntervalSeconds'.
	 */
    public void setDiskExpiryThreadIntervalSeconds(
			int diskExpiryThreadIntervalSeconds) {
		this.diskExpiryThreadIntervalSeconds = diskExpiryThreadIntervalSeconds;
	}

	/**
	 * Getter for property 'diskStore'.
	 * 
	 * @return Value for property 'diskStore'.
	 */
    public String getDiskStore() {
		return diskStore;
	}

	/**
	 * Setter for property 'diskStore'.
	 * 
	 * @param diskStore Value to set for property 'diskStore'.
	 */
    public void setDiskStore(String diskStore) {
		this.diskStore = System.getProperty("diskStore");
	}

	/**
	 * Getter for property 'cacheManagerEventListener'.
	 * 
	 * @return Value for property 'cacheManagerEventListener'.
	 */
    public CacheManagerEventListener getCacheManagerEventListener() {
		return cacheManagerEventListener;
	}

	/**
	 * Setter for property 'cacheManagerEventListener'.
	 * 
	 * @param cacheManagerEventListener Value to set for property 'cacheManagerEventListener'.
	 */
    public void setCacheManagerEventListener(
			CacheManagerEventListener cacheManagerEventListener) {
		this.cacheManagerEventListener = cacheManagerEventListener;
	}

	/**
	 * Getter for property 'cacheHit'.
	 * 
	 * @return Value for property 'cacheHit'.
	 */
    public static long getCacheHit() {
		return cache.getHitCount();
	}

	/**
	 * Getter for property 'cacheMiss'.
	 * 
	 * @return Value for property 'cacheMiss'.
	 */
    public static long getCacheMiss() {
		return cache.getMissCountExpired() + cache.getMissCountNotFound();
	}	
	
	/** {@inheritDoc} */
    public void destroy() {
		// Shut down the cache manager
		try {
			CacheManager.getInstance().shutdown();
		} catch (Exception e) {
			log.warn("Error on cache shutdown", e);
		}
	}
}
