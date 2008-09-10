package org.red5.server.api.remoting;

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

import java.util.Collection;

import org.red5.server.api.IConnection;

// TODO: Auto-generated Javadoc
/**
 * Connection coming from Remoting clients.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IRemotingConnection extends IConnection {

	/**
	 * Tell the client to add a header with all further requests. This is
	 * returned to the client as response for the next request received.
	 * 
	 * @param name name of the header to add
	 * @param value value of the header to add
	 */
	public void addHeader(String name, Object value);

	/**
	 * Tell the client to add a header with all further requests. This is
	 * returned to the client as response for the next request received.
	 * 
	 * @param name name of the header to add
	 * @param value value of the header to add
	 * @param mustUnderstand a boolean flag specifying if the server must pocess this header
	 * before handling following headers or messages
	 */
	public void addHeader(String name, Object value, boolean mustUnderstand);
	
	/**
	 * Tell the client to no longer send a header with all further requests.
	 * This is returned to the client as response for the next request
	 * received.
	 * 
	 * @param name name of the header to remove
	 */
	public void removeHeader(String name);

	/**
	 * Return headers to send.
	 * 
	 * @return the headers
	 */
	public Collection<IRemotingHeader> getHeaders();
	
}
