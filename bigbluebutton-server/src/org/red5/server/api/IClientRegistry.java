package org.red5.server.api;

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

import org.red5.server.exception.ClientNotFoundException;
import org.red5.server.exception.ClientRejectedException;

// TODO: Auto-generated Javadoc
/**
 * Provides a registry of client objects.
 * You can lookup a client by its client id / session id using lookupClient method.
 * This interface implementations also create new client objects from given params, usually
 * passed from client-side Flex/Flash application upon initial connection.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface IClientRegistry {

	/**
	 * Check if a client with a given id exists.
	 * 
	 * @param id the id of the client to check for
	 * 
	 * @return <code>true</code> if the client exists, <code>false</code> otherwise
	 */
	public boolean hasClient(String id);

	/**
	 * Create a new client client object from connection params.
	 * 
	 * @param params the parameters the client passed during connection
	 * 
	 * @return the new client
	 * 
	 * @throws ClientNotFoundException no client could be created from the passed parameters
	 * @throws ClientRejectedException the client is not allowed to connect
	 */
	public IClient newClient(Object[] params) throws ClientNotFoundException,
			ClientRejectedException;

	/**
	 * Return an existing client from a client id.
	 * 
	 * @param id the id of the client to return
	 * 
	 * @return the client object
	 * 
	 * @throws ClientNotFoundException no client with the passed id exists
	 */
	public IClient lookupClient(String id) throws ClientNotFoundException;

}