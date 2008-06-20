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
 * This interface encapsulates the mapping strategy used by the context.
 */
public interface IMappingStrategy {

	/**
	 * Map a name to the name of a service.
	 * 
	 * @param name name to map
	 * 
	 * @return      The name of the service with the passed name
	 */
	public String mapServiceName(String name);

	/**
	 * Map a context path to the name of a scope handler.
	 * 
	 * @param contextPath context path to map
	 * 
	 * @return      The name of a scope handler
	 */
	public String mapScopeHandlerName(String contextPath);

	/**
	 * Map a context path to a path prefix for resources.
	 * 
	 * @param contextPath context path to map
	 * 
	 * @return      The path prefix for resources with the given name
	 */
	public String mapResourcePrefix(String contextPath);

}