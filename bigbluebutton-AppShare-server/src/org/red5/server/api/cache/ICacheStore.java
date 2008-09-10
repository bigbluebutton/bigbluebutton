package org.red5.server.api.cache;

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

// TODO: Auto-generated Javadoc
/**
 * Storage for cacheable objects. Selected cache engines must implement this
 * interface.
 * 
 * <p>
 * 
 * @see <a href="http://www-128.ibm.com/developerworks/java/library/j-jtp01246.html">Soft references provide for quick-and-dirty caching</a>
 * @see <a href="http://java.sun.com/developer/technicalArticles/ALT/RefObj/">Reference Objects and Garbage Collection</a>
 * @see <a href="http://www.onjava.com/pub/a/onjava/2002/10/02/javanio.html?page=3">Top Ten New Things You Can Do with NIO</a>
 * @see <a href="http://csci.csusb.edu/turner/archive/courses/aiit2004/proxy_cache_solution.html">http://csci.csusb.edu/turner/archive/courses/aiit2004/proxy_cache_solution.html</a>
 * </p>
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public interface ICacheStore {

	/**
	 * Offer an object to the cache with an associated key.
	 * If the named object exists in cache, it will not be accepted.
	 * 
	 * @param name string name representing the object
	 * @param obj cacheable object
	 * 
	 * @return true if accepted, false otherwise
	 */
	public boolean offer(String name, Object obj);

	/**
	 * Puts an object in the cache with the associated key.
	 * 
	 * @param name string name representing the object
	 * @param obj cacheable object
	 */
	public void put(String name, Object obj);

	/**
	 * Return a cached object with the given name.
	 * 
	 * @param name the name of the object to return
	 * 
	 * @return the object or <code>null</code> if no such object was found
	 */
	public ICacheable get(String name);

	/**
	 * Delete the passed cached object.
	 * 
	 * @param obj the object to delete
	 * 
	 * @return true, if removes the
	 */
	public boolean remove(ICacheable obj);

	/**
	 * Delete the cached object with the given name.
	 * 
	 * @param name the name of the object to delete
	 * 
	 * @return true, if removes the
	 */
	public boolean remove(String name);

	/**
	 * Return iterator over the names of all already loaded objects in the
	 * storage.
	 * 
	 * @return iterator over all objects names
	 */
	public Iterator<String> getObjectNames();

	/**
	 * Return iterator over the already loaded objects in the storage.
	 * 
	 * @return iterator over all objects
	 */
	public Iterator<SoftReference<? extends ICacheable>> getObjects();

	/**
	 * Sets the maximum number of entries for the cache.
	 * 
	 * @param max upper-limit of the cache
	 */
	public void setMaxEntries(int max);

	/**
	 * Allows for cleanup of a cache implementation.
	 */
	public void destroy();

}
