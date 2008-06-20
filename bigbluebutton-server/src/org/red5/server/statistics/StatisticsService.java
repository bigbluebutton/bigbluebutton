package org.red5.server.statistics;

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

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.ScopeUtils;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.so.ISharedObjectService;
import org.red5.server.api.statistics.ISharedObjectStatistics;
import org.red5.server.api.statistics.IStatisticsService;
import org.red5.server.exception.ScopeNotFoundException;
import org.red5.server.exception.SharedObjectException;

// TODO: Auto-generated Javadoc
/**
 * Implementation of the statistics service.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 */
public class StatisticsService implements IStatisticsService {

	/** The Constant SCOPE_STATS_SO_NAME. */
	private static final String SCOPE_STATS_SO_NAME = "red5ScopeStatistics";
	
	/** The Constant SO_STATS_SO_NAME. */
	private static final String SO_STATS_SO_NAME = "red5SharedObjectStatistics";
	
	/** The global scope. */
	private IScope globalScope;

	/**
	 * Sets the global scope.
	 * 
	 * @param scope the new global scope
	 */
	public void setGlobalScope(IScope scope) {
		globalScope = scope;
	}
	
	/* (non-Javadoc)
	 * @see org.red5.server.api.statistics.IStatisticsService#getScopeStatisticsSO(org.red5.server.api.IScope)
	 */
	public ISharedObject getScopeStatisticsSO(IScope scope) {
		ISharedObjectService soService = (ISharedObjectService) ScopeUtils.getScopeService(scope, ISharedObjectService.class, false);
		return soService.getSharedObject(scope, SCOPE_STATS_SO_NAME, false);
	}

	/**
	 * Gets the scope.
	 * 
	 * @param path the path
	 * 
	 * @return the scope
	 * 
	 * @throws ScopeNotFoundException the scope not found exception
	 */
	private IScope getScope(String path) throws ScopeNotFoundException {
		IScope scope;
		if (path != null && !path.equals("")) {
			scope = ScopeUtils.resolveScope(globalScope, path);
		} else {
			scope = globalScope;
		}

		if (scope == null) {
			throw new ScopeNotFoundException(globalScope, path);
		}

		return scope;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.statistics.IStatisticsService#getScopes()
	 */
	public Set<String> getScopes() {
		return getScopes(null);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.statistics.IStatisticsService#getScopes(java.lang.String)
	 */
	public Set<String> getScopes(String path) throws ScopeNotFoundException {
		IScope scope = getScope(path);
		Set<String> result = new HashSet<String>();
		Iterator<String> iter = scope.getScopeNames();
		while (iter.hasNext()) {
			String name = iter.next();
			result.add(name.substring(name.indexOf(IScope.SEPARATOR) + 1));
		}

		return result;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.statistics.IStatisticsService#getSharedObjectStatisticsSO(org.red5.server.api.IScope)
	 */
	public ISharedObject getSharedObjectStatisticsSO(IScope scope) {
		ISharedObjectService soService = (ISharedObjectService) ScopeUtils.getScopeService(scope, ISharedObjectService.class, false);
		return soService.getSharedObject(scope, SO_STATS_SO_NAME, false);
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.statistics.IStatisticsService#getSharedObjects(java.lang.String)
	 */
	public Set<ISharedObjectStatistics> getSharedObjects(String path) {
		IScope scope = getScope(path);
		ISharedObjectService soService = (ISharedObjectService) ScopeUtils.getScopeService(scope, ISharedObjectService.class, false);
		Set<ISharedObjectStatistics> result = new HashSet<ISharedObjectStatistics>();
		for (String name: soService.getSharedObjectNames(scope)) {
			ISharedObject so = soService.getSharedObject(scope, name);
			result.add(so.getStatistics());
		}
		return result;
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.statistics.IStatisticsService#updateScopeStatistics(java.lang.String)
	 */
	public void updateScopeStatistics(String path)
			throws ScopeNotFoundException {
		IScope scope = getScope(path);
		ISharedObject so = getScopeStatisticsSO(Red5.getConnectionLocal().getScope());
		so.setAttribute(path, scope.getAttributes());
	}

	/* (non-Javadoc)
	 * @see org.red5.server.api.statistics.IStatisticsService#updateSharedObjectStatistics(java.lang.String, java.lang.String)
	 */
	public void updateSharedObjectStatistics(String path, String name)
			throws ScopeNotFoundException, SharedObjectException {
		IScope scope = getScope(path);
		ISharedObjectService soService = (ISharedObjectService) ScopeUtils.getScopeService(scope, ISharedObjectService.class, false);
		ISharedObject sourceSO = soService.getSharedObject(scope, name);
		if (sourceSO == null)
			throw new SharedObjectException();
		
		ISharedObject so = getSharedObjectStatisticsSO(Red5.getConnectionLocal().getScope());
		so.setAttribute(path+'|'+name, sourceSO.getData());
	}

}
