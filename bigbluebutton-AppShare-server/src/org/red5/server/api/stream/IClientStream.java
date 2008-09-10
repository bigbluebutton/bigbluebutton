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

import org.red5.server.api.IBWControllable;

// TODO: Auto-generated Javadoc
/**
 * A stream that is bound to a client.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IClientStream extends IStream, IBWControllable {
	
	/** The Constant MODE_READ. */
	public static final String MODE_READ = "read";

	/** The Constant MODE_RECORD. */
	public static final String MODE_RECORD = "record";

	/** The Constant MODE_APPEND. */
	public static final String MODE_APPEND = "append";

	/** The Constant MODE_LIVE. */
	public static final String MODE_LIVE = "live";

	/**
	 * Get stream id allocated in a connection.
	 * 
	 * @return the stream id
	 */
	int getStreamId();

	/**
	 * Get connection containing the stream.
	 * 
	 * @return the connection object or <code>null</code> if the connection is no longer active
	 */
	IStreamCapableConnection getConnection();

	/**
	 * Set the buffer duration for this stream as requested by the client.
	 * 
	 * @param bufferTime duration in ms the client wants to buffer
	 */
	void setClientBufferDuration(int bufferTime);
	
}
