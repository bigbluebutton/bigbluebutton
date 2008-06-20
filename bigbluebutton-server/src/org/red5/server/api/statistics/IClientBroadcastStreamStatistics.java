package org.red5.server.api.statistics;

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
 * Statistical informations about a stream that is broadcasted by a client.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IClientBroadcastStreamStatistics extends IStreamStatistics {

	/**
	 * Get the filename the stream is being saved as.
	 * 
	 * @return The filename relative to the scope or <code>null</code>
	 * if the stream is not being saved.
	 */
	public String getSaveFilename();

	/**
	 * Get stream publish name. Publish name is the value of the first parameter
	 * had been passed to <code>NetStream.publish</code> on client side in
	 * SWF.
	 * 
	 * @return Stream publish name
	 */
	public String getPublishedName();

	/**
	 * Return total number of subscribers.
	 * 
	 * @return number of subscribers
	 */
	public int getTotalSubscribers();
	
	/**
	 * Return maximum number of concurrent subscribers.
	 * 
	 * @return number of subscribers
	 */
	public int getMaxSubscribers();
	
	/**
	 * Return current number of subscribers.
	 * 
	 * @return number of subscribers
	 */
	public int getActiveSubscribers();
	
	/**
	 * Return total number of bytes received from client for this stream.
	 * 
	 * @return number of bytes
	 */
	public long getBytesReceived();
	
}
