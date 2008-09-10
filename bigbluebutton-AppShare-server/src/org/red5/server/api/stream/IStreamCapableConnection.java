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
import org.red5.server.api.IConnection;

// TODO: Auto-generated Javadoc
/**
 * A connection that supports streaming.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 * @author Steven Gong (steven.gong@gmail.com)
 */
public interface IStreamCapableConnection extends IConnection,
		IBWControllable {

	/**
	 * Return a reserved stream id for use.
	 * According to FCS/FMS regulation, the base is 1.
	 * 
	 * @return              Reserved stream id
	 */
	int reserveStreamId();

	/**
	 * Unreserve this id for future use.
	 * 
	 * @param streamId      ID of stream to unreserve
	 */
	void unreserveStreamId(int streamId);

	/**
	 * Deletes the stream with the given id.
	 * 
	 * @param streamId      ID of stream to delete
	 */
	void deleteStreamById(int streamId);

	/**
	 * Get a stream by its id.
	 * 
	 * @param streamId      Stream id
	 * 
	 * @return              Stream with given id
	 */
	IClientStream getStreamById(int streamId);

	/**
	 * Create a stream that can play only one item.
	 * 
	 * @param streamId      Stream id
	 * 
	 * @return              New subscriber stream that can play only one item
	 */
	ISingleItemSubscriberStream newSingleItemSubscriberStream(int streamId);

	/**
	 * Create a stream that can play a list.
	 * 
	 * @param streamId      Stream id
	 * 
	 * @return              New stream that can play sequence of items
	 */
	IPlaylistSubscriberStream newPlaylistSubscriberStream(int streamId);

	/**
	 * Create a broadcast stream.
	 * 
	 * @param streamId      Stream id
	 * 
	 * @return              New broadcast stream
	 */
	IClientBroadcastStream newBroadcastStream(int streamId);

	/**
	 * Total number of video messages that are pending to be sent to a stream.
	 * 
	 * @param streamId       Stream id
	 * 
	 * @return               Number of pending video messages
	 */
	long getPendingVideoMessages(int streamId);

}