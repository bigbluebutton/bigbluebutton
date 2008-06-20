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

import org.red5.server.api.IScope;

// TODO: Auto-generated Javadoc
/**
 * Base interface for stream objects.
 * A stream object is always associated with a scope.
 */
public interface IStream {

	/**
	 * Get the name of the stream. The name is unique across the server. This is
	 * just an id of the stream and NOT the name that is used at client side to
	 * subscribe to the stream. For that name, use
	 * {@link IBroadcastStream#getPublishedName()}
	 * 
	 * @return the name of the stream
	 */
	public String getName();

	/**
	 * Get Codec info for a stream.
	 * 
	 * @return the codec info
	 */
	IStreamCodecInfo getCodecInfo();

	/**
	 * Get the scope this stream is associated with.
	 * 
	 * @return scope object
	 */
	public IScope getScope();

	/**
	 * Start this stream.
	 */
	public void start();

	/**
	 * Stop this stream.
	 */
	public void stop();

	/**
	 * Close this stream.
	 */
	public void close();

}
