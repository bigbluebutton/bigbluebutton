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

import java.util.List;

import org.red5.server.exception.ClientNotFoundException;

// TODO: Auto-generated Javadoc
/**
 * An MBean interface for the client registry.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public interface ClientRegistryMBean {

	/**
	 * Next id.
	 * 
	 * @return the string
	 */
	public String nextId();

	/**
	 * Checks for client.
	 * 
	 * @param id the id
	 * 
	 * @return true, if successful
	 */
	public boolean hasClient(String id);

	/**
	 * Lookup client.
	 * 
	 * @param id the id
	 * 
	 * @return the i client
	 * 
	 * @throws ClientNotFoundException the client not found exception
	 */
	public IClient lookupClient(String id) throws ClientNotFoundException;

	/**
	 * New client.
	 * 
	 * @param params the params
	 * 
	 * @return the i client
	 */
	public IClient newClient(Object[] params);

	/**
	 * Gets the client list.
	 * 
	 * @return the client list
	 */
	public List<IClient> getClientList();

	/**
	 * Gets the client.
	 * 
	 * @param id the id
	 * 
	 * @return the client
	 * 
	 * @throws ClientNotFoundException the client not found exception
	 */
	public IClient getClient(String id) throws ClientNotFoundException;

}