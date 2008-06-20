package org.red5.server.api.stream;

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

import org.red5.server.api.IScope;

// TODO: Auto-generated Javadoc
/**
 * The Interface IBroadcastStreamService.
 */
public interface IBroadcastStreamService {

	/** The Constant BROADCAST_STREAM_SERVICE. */
	public final static String BROADCAST_STREAM_SERVICE = "broadcastStreamService";

	/**
	 * Does the scope have a broadcast stream registered with a given name.
	 * 
	 * @param scope the scope to check for the stream
	 * @param name name of the broadcast
	 * 
	 * @return true is a stream exists, otherwise false
	 */
	public boolean hasBroadcastStream(IScope scope, String name);

	/**
	 * Get a broadcast stream by name.
	 * 
	 * @param scope the scope to return the stream from
	 * @param name the name of the broadcast
	 * 
	 * @return broadcast stream object
	 */
	public IBroadcastStream getBroadcastStream(IScope scope, String name);

	/**
	 * Get a set containing the names of all the broadcasts.
	 * 
	 * @param scope the scope to search for streams
	 * 
	 * @return set containing all broadcast names
	 */
	public List<String> getBroadcastStreamNames(IScope scope);

}
