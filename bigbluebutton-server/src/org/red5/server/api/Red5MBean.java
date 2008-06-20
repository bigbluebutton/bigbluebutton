package org.red5.server.api;

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
 * JMX interface for accessing Red5 API objects.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Paul Gregoire (mondain@gmail.com)
 */
public interface Red5MBean {

	/**
	 * Gets the connection.
	 * 
	 * @return the connection
	 */
	public IConnection getConnection();

	/**
	 * Gets the scope.
	 * 
	 * @return the scope
	 */
	public IScope getScope();

	/**
	 * Gets the client.
	 * 
	 * @return the client
	 */
	public IClient getClient();

	/**
	 * Gets the context.
	 * 
	 * @return the context
	 */
	public IContext getContext();

}