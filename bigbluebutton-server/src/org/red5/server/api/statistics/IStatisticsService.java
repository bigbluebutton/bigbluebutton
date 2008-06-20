package org.red5.server.api.statistics;

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

import java.util.Set;

import org.red5.server.api.IScope;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.exception.ScopeNotFoundException;
import org.red5.server.exception.SharedObjectException;

// TODO: Auto-generated Javadoc
/**
 * Statistics methods for Red5. They can be used to poll for updates of
 * given elements inside the server. Statistics data will be stored as
 * properties of different shared objects.
 * 
 * Use <code>getScopeStatisticsSO</code> and <code>getSharedObjectStatisticsSO</code>
 * to get these shared objects. The property names are <code>scopeName</code>
 * for scope attributes and <code>scopeName|sharedObjectName</code> for
 * shared object attributes. Each property holds a Map containing key/value
 * mappings of the corresponding attributes.
 * 
 * Sometime in the future, the updates on the shared objects will be done
 * automatically so a client doesn't need to poll for them.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public interface IStatisticsService {
	
	/**
	 * Return the shared object that will be used to keep scope statistics.
	 * 
	 * @param scope A scope to return the shared object for.
	 * 
	 * @return the shared object containing scope statistics
	 */
	public ISharedObject getScopeStatisticsSO(IScope scope);
	
	/**
	 * Return the shared object that will be used to keep SO statistics.
	 * 
	 * @param scope A scope to return the shared object for.
	 * 
	 * @return the shared object containing SO statistics
	 */
	public ISharedObject getSharedObjectStatisticsSO(IScope scope);
	
	/**
	 * Return a list of all scopes that currently exist on the server.
	 * 
	 * @return list of scope names
	 */
	public Set<String> getScopes();

	/**
	 * Return a list of all scopes that currently exist on the server
	 * below a current path.
	 * 
	 * @param path Path to start looking for scopes.
	 * 
	 * @return list of scope names
	 * 
	 * @throws ScopeNotFoundException if the path on the server doesn't exist
	 */
	public Set<String> getScopes(String path)
			throws ScopeNotFoundException;

	/**
	 * Update statistics for a given scope.
	 * 
	 * @param path Path to scope to update.
	 * 
	 * @throws ScopeNotFoundException if the given scope doesn't exist
	 */
	public void updateScopeStatistics(String path)
			throws ScopeNotFoundException;
	
	/**
	 * Return informations about shared objects for a given scope.
	 * 
	 * @param path Path to scope to return shared object names for.
	 * 
	 * @return list of informations about shared objects
	 */
	public Set<ISharedObjectStatistics> getSharedObjects(String path);
	
	/**
	 * Update informations about a shared object in a given scope.
	 * 
	 * @param path Path to scope that contains the shared object.
	 * @param name Name of shared object to update.
	 * 
	 * @throws ScopeNotFoundException if the given scope doesn't exist
	 * @throws SharedObjectException if no shared object with the given name exists
	 */
	public void updateSharedObjectStatistics(String path, String name)
			throws ScopeNotFoundException, SharedObjectException;

}
