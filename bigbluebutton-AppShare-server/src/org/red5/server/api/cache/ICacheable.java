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

import org.apache.mina.common.ByteBuffer;

// TODO: Auto-generated Javadoc
/**
 * Base interface for objects that can be made cacheable.
 * 
 * @see ICacheStore
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public interface ICacheable {

	/**
	 * Returns <code>true</code> if the object is cached, <code>false</code>
	 * otherwise.
	 * 
	 * @return <code>true</code> if object is cached, <code>false</code> otherwise
	 */
	public boolean isCached();

	/**
	 * Sets a flag to represent the cached status of a cacheable object.
	 * 
	 * @param cached    <code>true</code> if object is cached, <code>false</code> otherwise
	 */
	public void setCached(boolean cached);

	/**
	 * Returns the name of the cached object.
	 * 
	 * @return  Object name
	 */
	public String getName();

	/**
	 * Set the name of the cached object.
	 * 
	 * @param name New object name
	 */
	public void setName(String name);

	/**
	 * Returns the object contained within the cacheable reference.
	 * 
	 * @return    Cached representation of object
	 */
	public byte[] getBytes();

	/**
	 * Returns a readonly byte buffer.
	 * 
	 * @return     Read-only byte buffer with cached data
	 */
	public ByteBuffer getByteBuffer();

}
