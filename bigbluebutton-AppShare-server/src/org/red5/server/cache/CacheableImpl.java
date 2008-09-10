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

import org.apache.mina.common.ByteBuffer;
import org.red5.server.api.cache.ICacheable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;

// TODO: Auto-generated Javadoc
/**
 * Provides an implementation of a cacheable object.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public class CacheableImpl implements ICacheable {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(CacheableImpl.class);

	/** The application context. */
	protected ApplicationContext applicationContext;

	/** The bytes. */
	private byte[] bytes;

	/** The name. */
	private String name;

	/** The cached. */
	private boolean cached;

	/**
	 * Instantiates a new cacheable impl.
	 * 
	 * @param obj the obj
	 */
	public CacheableImpl(Object obj) {
		ByteBuffer tmp = ByteBuffer.allocate(1024, true);
		tmp.setAutoExpand(true);
		tmp.putObject(obj);
		bytes = new byte[tmp.capacity()];
		tmp.get(bytes);
		cached = true;
		tmp.release();
		tmp = null;
	}

	/**
	 * Instantiates a new cacheable impl.
	 * 
	 * @param buffer the buffer
	 */
	public CacheableImpl(ByteBuffer buffer) {
		if (log.isDebugEnabled()) {
			log.debug("Buffer is direct: " + buffer.isDirect() + " capacity: " + buffer.capacity());
			log.debug("Buffer limit: " + buffer.limit() + " remaining: "
				+ buffer.remaining() + " position: " + buffer.position());
		}
		bytes = new byte[buffer.capacity()];
		buffer.rewind();
		int i = 0;
		while (i < buffer.limit()) {
			buffer.position(i);
			while (buffer.remaining() > 0) {
				bytes[i++] = buffer.get();
			}
		}
		cached = true;
		if (log.isDebugEnabled()) {
			log.debug("Buffer size: " + buffer.capacity());
		}
		buffer = null;
	}

	/**
	 * Adds the request.
	 */
	public void addRequest() {
		log.info("Adding request for: " + name);
	}

	/** {@inheritDoc} */
    public byte[] getBytes() {
		return bytes;
	}

	/** {@inheritDoc} */
    public ByteBuffer getByteBuffer() {
		return ByteBuffer.wrap(bytes).asReadOnlyBuffer();
	}

	/** {@inheritDoc} */
    public String getName() {
		return name;
	}

	/** {@inheritDoc} */
    public boolean isCached() {
		return cached;
	}

	/** {@inheritDoc} */
    public void setCached(boolean cached) {
		this.cached = cached;
	}

	/** {@inheritDoc} */
    public void setName(String name) {
		this.name = name;
	}

}
