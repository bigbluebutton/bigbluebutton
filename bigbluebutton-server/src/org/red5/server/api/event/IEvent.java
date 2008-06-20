package org.red5.server.api.event;

// TODO: Auto-generated Javadoc
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

/**
 * IEvent interfaces is the essential interface every Event should implement.
 */
public interface IEvent {
	
	/**
	 * Returns even type.
	 * 
	 * @return Event type enumeration
	 */
	public Type getType();
	
	/**
	 * Returns event context object.
	 * 
	 * @return Event context object
	 */
	public Object getObject();
	
	/**
	 * Whether event has source (event listener(s)).
	 * 
	 * @return <code>true</code> if so, <code>false</code> otherwise
	 */
	public boolean hasSource();
	
	/**
	 * Returns event listener.
	 * 
	 * @return Event listener object
	 */
	public IEventListener getSource();

	/**
	 * The Enum Type.
	 */
	enum Type {
		
		/** The SYSTEM. */
		SYSTEM, 
 /** The STATUS. */
 STATUS, 
 /** The SERVIC e_ call. */
 SERVICE_CALL, 
 /** The SHARE d_ object. */
 SHARED_OBJECT, 
 /** The STREA m_ control. */
 STREAM_CONTROL, 
 /** The STREA m_ data. */
 STREAM_DATA, 
 /** The CLIENT. */
 CLIENT, 
 /** The SERVER. */
 SERVER
	}

}
