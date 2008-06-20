package org.red5.server.api;

import org.red5.server.exception.ScopeNotFoundException;

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
 * Resolve the scope from given a host and path. Resolver implementations
 * depend on context naming strategy and so forth.
 */
public interface IScopeResolver {

	/**
	 * Return the global scope.
	 * 
	 * @return      Global scope
	 */
	public IGlobalScope getGlobalScope();

	/**
	 * Get the scope for a given path.
	 * 
	 * @param path Path to return the scope for
	 * 
	 * @return      Scope for passed path
	 * 
	 * @throws ScopeNotFoundException If scope doesn't exist an can't be created
	 */
	public IScope resolveScope(String path);

	/**
	 * Get the scope for a given path from a root scope.
	 * 
	 * @param root The scope to start traversing from.
	 * @param path Path to return the scope for.
	 * 
	 * @return 	Scope for passed path.
	 */
	public IScope resolveScope(IScope root, String path);

}