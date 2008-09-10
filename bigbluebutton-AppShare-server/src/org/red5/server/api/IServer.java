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

import java.util.Iterator;
import java.util.Map;

import org.red5.server.api.listeners.IConnectionListener;
import org.red5.server.api.listeners.IScopeListener;

// TODO: Auto-generated Javadoc
/**
 * The interface that represents the Red5 server.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface IServer {
	
	/** Server ID. */
	public static final String ID = "red5.server";

	/**
	 * Get the global scope with given name.
	 * 
	 * @param name Name of the global scope
	 * 
	 * @return the global scope
	 */
	public IGlobalScope getGlobal(String name);

	/**
	 * Register a global scope.
	 * 
	 * @param scope The global scope to register
	 */
	public void registerGlobal(IGlobalScope scope);

	/**
	 * Lookup the global scope for a host.
	 * 
	 * @param hostName The name of the host
	 * @param contextPath The path in the host
	 * 
	 * @return The found global scope or <code>null</code>
	 */
	public IGlobalScope lookupGlobal(String hostName, String contextPath);

	/**
	 * Map a virtual hostname and a path to the name of a global scope.
	 * 
	 * @param hostName The name of the host to map
	 * @param contextPath The path to map
	 * @param globalName The name of the global scope to map to
	 * 
	 * @return <code>true</code> if the name was mapped, otherwise
	 * <code>false</code>
	 */
	public boolean addMapping(String hostName, String contextPath,
			String globalName);

	/**
	 * Unregister a previously mapped global scope.
	 * 
	 * @param hostName The name of the host to unmap
	 * @param contextPath The path for this host to unmap
	 * 
	 * @return <code>true</code> if the global scope was unmapped, otherwise
	 * <code>false</code>
	 */
	public boolean removeMapping(String hostName, String contextPath);

	/**
	 * Query informations about the global scope mappings.
	 * 
	 * @return Map containing informations about the mappings
	 */
	public Map<String, String> getMappingTable();

	/**
	 * Get list of global scope names.
	 * 
	 * @return Iterator for names of global scopes
	 */
	public Iterator<String> getGlobalNames();

	/**
	 * Get list of global scopes.
	 * 
	 * @return Iterator for global scopes objects
	 */
	public Iterator<IGlobalScope> getGlobalScopes();

	/**
	 * Add listener to get notified about scope events.
	 * 
	 * @param listener the listener to add
	 */
	public void addListener(IScopeListener listener);

	/**
	 * Add listener to get notified about connection events.
	 * 
	 * @param listener the listener to add
	 */
	public void addListener(IConnectionListener listener);

	/**
	 * Remove listener that got notified about scope events.
	 * 
	 * @param listener the listener to remove
	 */
	public void removeListener(IScopeListener listener);

	/**
	 * Remove listener that got notified about connection events.
	 * 
	 * @param listener the listener to remove
	 */
	public void removeListener(IConnectionListener listener);

}
