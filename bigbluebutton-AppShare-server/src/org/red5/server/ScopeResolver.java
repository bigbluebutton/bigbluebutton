package org.red5.server;

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

import org.red5.server.api.IGlobalScope;
import org.red5.server.api.IScope;
import org.red5.server.api.IScopeResolver;
import org.red5.server.exception.ScopeNotFoundException;
import org.red5.server.exception.ScopeShuttingDownException;

// TODO: Auto-generated Javadoc
/**
 * Resolves scopes from path.
 */
public class ScopeResolver implements IScopeResolver {
    
    /** Default host constant. */
	public static final String DEFAULT_HOST = "";
    
    /** Global scope. */
	protected IGlobalScope globalScope;

    /**
     * Getter for global scope.
     * 
     * @return      Global scope
     */
	public IGlobalScope getGlobalScope() {
		return globalScope;  
	}

    /**
     * Setter for global scope.
     * 
     * @param root        Global scope
     */
	public void setGlobalScope(IGlobalScope root) {
		this.globalScope = root;
	}

    /**
     * Return scope associated with given path.
     * 
     * @param path        Scope path
     * 
     * @return            Scope object
     */
	public IScope resolveScope(String path) {
        // Start from global scope
		return resolveScope(globalScope, path);
	}

    /**
     * Return scope associated with given path from given root scope.
     * 
     * @param root        Scope to start from
     * @param path        Scope path
     * 
     * @return            Scope object
     */
	public IScope resolveScope(IScope root, String path) {
        // Start from root scope
        IScope scope = root;
        // If there's no path return root scope (e.i. root path scope)
        if (path == null) {
			return scope;
		}
        // Split path to parts
        final String[] parts = path.split("/");
        // Iterate thru them, skip empty parts
		for (String room : parts) {
			if (room.equals("")) {
				// Skip empty path elements
				continue;
			}

			if (scope.hasChildScope(room)) {
				scope = scope.getScope(room);
			} else if (!scope.equals(root)) {
				// Synchronizing to make sure a subscope with the same name
				// is not created multiple times.
				synchronized (scope) {
					// Check again as a different thread might have created the
					// child while we waited for the synchronized block.
					if (scope.hasChildScope(room)) {
						scope = scope.getScope(room);
					} else if (scope.createChildScope(room)) {
						scope = scope.getScope(room);
					} else {
						throw new ScopeNotFoundException(scope, room);
					}
				}
			} else {
				throw new ScopeNotFoundException(scope, room);
			}
			
			if (scope instanceof WebScope && ((WebScope) scope).isShuttingDown()) {
				throw new ScopeShuttingDownException(scope);
			}
		}
		return scope;
	}

}
