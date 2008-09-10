package org.red5.server.api.stream;

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
 * The Interface IStreamHandler.
 */
public interface IStreamHandler {

	/**
	 * Called when the client begins publishing.
	 * 
	 * @param stream the stream object
	 */
	void onStreamPublishStart(IStream stream);

	/**
	 * Called when the client stops publishing.
	 * 
	 * @param stream the stream object
	 */
	void onStreamPublishStop(IStream stream);

	/**
	 * Called when the broadcast starts.
	 * 
	 * @param stream the stream object
	 */
	void onBroadcastStreamStart(IStream stream);

	/**
	 * Called when a recording starts.
	 * 
	 * @param stream the stream object
	 */
	void onRecordStreamStart(IStream stream);

	/**
	 * Called when a recording stops.
	 * 
	 * @param stream the stream object
	 */
	void onRecordStreamStop(IStream stream);

	/**
	 * Called when a client subscribes to a broadcast.
	 * 
	 * @param stream the stream object
	 */
	void onBroadcastStreamSubscribe(IBroadcastStream stream);

	/**
	 * Called when a client unsubscribes from a broadcast.
	 * 
	 * @param stream the stream object
	 */
	void onBroadcastStreamUnsubscribe(IBroadcastStream stream);

	/**
	 * Called when a client connects to an on demand stream.
	 * 
	 * @param stream the stream object
	 */
	void onOnDemandStreamConnect(IOnDemandStream stream);

	/**
	 * Called when a client disconnects from an on demand stream.
	 * 
	 * @param stream the stream object
	 */
	void onOnDemandStreamDisconnect(IOnDemandStream stream);

}
