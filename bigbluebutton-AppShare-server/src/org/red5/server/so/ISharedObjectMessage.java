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

import java.util.List;

import org.red5.server.net.rtmp.event.IRTMPEvent;

// TODO: Auto-generated Javadoc
/**
 * Shared object message.
 */
public interface ISharedObjectMessage extends IRTMPEvent {

	/**
	 * Returns the name of the shared object this message belongs to.
	 * 
	 * @return name of the shared object
	 */
	public String getName();

	/**
	 * Returns the version to modify.
	 * 
	 * @return version to modify
	 */
	public int getVersion();

	/**
	 * Does the message affect a persistent shared object?.
	 * 
	 * @return true if a persistent shared object should be updated otherwise
	 * false
	 */
	public boolean isPersistent();

	/**
	 * Returns a set of ISharedObjectEvent objects containing informations what
	 * to change.
	 * 
	 * @return set of ISharedObjectEvents
	 */
	public List<ISharedObjectEvent> getEvents();

    /**
     * Addition event handler.
     * 
     * @param type           Event type
     * @param key            Handler key
     * @param value          Event value (like arguments)
     */
    public void addEvent(ISharedObjectEvent.Type type, String key, Object value);

    /**
     * Add event handler.
     * 
     * @param event          SO event
     */
	public void addEvent(ISharedObjectEvent event);

    /**
     * Clear shared object.
     */
    public void clear();

	/**
	 * Is empty?.
	 * 
	 * @return  <code>true</code> if shared object is empty, <code>false</code> otherwise
	 */
    public boolean isEmpty();

}
