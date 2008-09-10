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
 * Statistical informations about a scope.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IScopeStatistics extends IStatisticsBase {

	/**
	 * Get the name of this scope. Eg. <code>someroom</code>.
	 * 
	 * @return the name
	 */
	public String getName();

	/**
	 * Get the full absolute path. Eg. <code>host/myapp/someroom</code>.
	 * 
	 * @return Absolute scope path
	 */
	public String getPath();

	/**
	 * Get the scopes depth, how far down the scope tree is it. The lowest depth
	 * is 0x00, the depth of Global scope. Application scope depth is 0x01. Room
	 * depth is 0x02, 0x03 and so forth.
	 * 
	 * @return the depth
	 */
	public int getDepth();
	
	/**
	 * Return total number of connections to the scope.
	 * 
	 * @return number of connections
	 */
	public int getTotalConnections();
	
	/**
	 * Return maximum number of concurrent connections to the scope.
	 * 
	 * @return number of connections
	 */
	public int getMaxConnections();
	
	/**
	 * Return current number of connections to the scope.
	 * 
	 * @return number of connections
	 */
	public int getActiveConnections();
	
	/**
	 * Return total number of clients connected to the scope.
	 * 
	 * @return number of clients
	 */
	public int getTotalClients();
	
	/**
	 * Return maximum number of clients concurrently connected to the scope.
	 * 
	 * @return number of clients
	 */
	public int getMaxClients();
	
	/**
	 * Return current number of clients connected to the scope.
	 * 
	 * @return number of clients
	 */
	public int getActiveClients();
	
	/**
	 * Return total number of subscopes created.
	 * 
	 * @return number of subscopes created
	 */
	public int getTotalSubscopes();
	
	/**
	 * Return maximum number of concurrently existing subscopes.
	 * 
	 * @return number of subscopes
	 */
	public int getMaxSubscopes();
	
	/**
	 * Return number of currently existing subscopes.
	 * 
	 * @return number of subscopes
	 */
	public int getActiveSubscopes();
	
}
