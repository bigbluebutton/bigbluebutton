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
 * Provides an implementation of an object cache which actually
 * does not provide a cache.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class NoCacheImpl implements ICacheStore, ApplicationContextAware {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(NoCacheImpl.class);

	/** The instance. */
	private static NoCacheImpl instance;
	
	/**
	 * Do not instantiate NoCacheImpl.
	 */ 
	/*
	 * This constructor helps to ensure that we are singleton.
	 */
	private NoCacheImpl() {
	}

	/**
	 * Returns the instance of this class.
	 * 
	 * @return the instance
	 */
	public static NoCacheImpl getInstance() {
		if (instance == null) {
			instance = new NoCacheImpl();
		}
		return instance;
	}	
	
	// We store the application context in a ThreadLocal so we can access it
	// later.
	/** The application context. */
	private static ApplicationContext applicationContext = null;

	/** {@inheritDoc} */
    public void setApplicationContext(ApplicationContext context)
			throws BeansException {
		NoCacheImpl.applicationContext = context;
	}

	/**
	 * Getter for property 'applicationContext'.
	 * 
	 * @return Value for property 'applicationContext'.
	 */
    public static ApplicationContext getApplicationContext() {
		return applicationContext;
	}

	/** {@inheritDoc} */
    public Iterator<String> getObjectNames() {
		return null;
	}

	/** {@inheritDoc} */
    public Iterator<SoftReference<? extends ICacheable>> getObjects() {
		return null;
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
		return false;
	}

	/** {@inheritDoc} */
    public boolean offer(String name, Object obj) {
		return false;
	}

	/** {@inheritDoc} */
    public void put(String name, Object obj) {
	}

	/** {@inheritDoc} */
    public ICacheable get(String name) {
		return null;
	}

	/** {@inheritDoc} */
    public boolean remove(ICacheable obj) {
		return false;
	}

	/** {@inheritDoc} */
    public boolean remove(String name) {
	    return false;
	}

	/**
	 * Getter for property 'cacheHit'.
	 * 
	 * @return Value for property 'cacheHit'.
	 */
    public static long getCacheHit() {
		return 0;
	}

	/**
	 * Getter for property 'cacheMiss'.
	 * 
	 * @return Value for property 'cacheMiss'.
	 */
    public static long getCacheMiss() {
		return 0;
	}

	/** {@inheritDoc} */
    public void setMaxEntries(int max) {
	}

	/** {@inheritDoc} */
    public void destroy() {
	}
}
