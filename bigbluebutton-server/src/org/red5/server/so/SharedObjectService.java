package org.red5.server.so;

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

import static org.red5.server.api.so.ISharedObject.TYPE;

import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

import org.red5.server.api.IBasicScope;
import org.red5.server.api.IScope;
import org.red5.server.api.persistence.IPersistable;
import org.red5.server.api.persistence.IPersistenceStore;
import org.red5.server.api.persistence.PersistenceUtils;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.so.ISharedObjectService;
import org.red5.server.persistence.RamPersistence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Shared object service.
 */
public class SharedObjectService implements ISharedObjectService {
    
    /** Logger. */
	private Logger log = LoggerFactory.getLogger(SharedObjectService.class);
    
    /** Persistence store prefix. */
	private static final String SO_PERSISTENCE_STORE = IPersistable.TRANSIENT_PREFIX
			+ "_SO_PERSISTENCE_STORE_";
    
    /** Transient store prefix. */
	private static final String SO_TRANSIENT_STORE = IPersistable.TRANSIENT_PREFIX
			+ "_SO_TRANSIENT_STORE_";
    
    /** Persistence class name. */
	private String persistenceClassName = "org.red5.server.persistence.RamPersistence";

	/**
	 * Setter for persistence class name.
	 * 
	 * @param name  Setter for persistence class name
	 */
    public void setPersistenceClassName(String name) {
		persistenceClassName = name;
	}

    /**
     * Return scope store.
     * 
     * @param scope                Scope
     * @param persistent           Persistent store or not?
     * 
     * @return                     Scope's store
     */
    private IPersistenceStore getStore(IScope scope, boolean persistent) {
		IPersistenceStore store;
		if (!persistent) {
			// Use special store for non-persistent shared objects
			if (!scope.hasAttribute(SO_TRANSIENT_STORE)) {
				store = new RamPersistence(scope);
				scope.setAttribute(SO_TRANSIENT_STORE, store);
				return store;
			}

			return (IPersistenceStore) scope.getAttribute(SO_TRANSIENT_STORE);
		}

		// Evaluate configuration for persistent shared objects
		if (!scope.hasAttribute(SO_PERSISTENCE_STORE)) {
			try {
				store = PersistenceUtils.getPersistenceStore(scope,
						persistenceClassName);
				log.info("Created persistence store " + store
						+ " for shared objects.");
			} catch (Exception err) {
				log
						.error(
								"Could not create persistence store for shared objects, falling back to Ram persistence.",
								err);
				store = new RamPersistence(scope);
			}
			scope.setAttribute(SO_PERSISTENCE_STORE, store);
			return store;
		}

		return (IPersistenceStore) scope.getAttribute(SO_PERSISTENCE_STORE);
	}

	/** {@inheritDoc} */
    public boolean createSharedObject(IScope scope, String name,
			boolean persistent) {
		synchronized (scope) {
			if (hasSharedObject(scope, name)) {
				// The shared object already exists.
				return true;
			}
	
			final IBasicScope soScope = new SharedObjectScope(scope, name,
					persistent, getStore(scope, persistent));
			return scope.addChildScope(soScope);
		}
	}

	/** {@inheritDoc} */
    public ISharedObject getSharedObject(IScope scope, String name) {
		return (ISharedObject) scope.getBasicScope(TYPE, name);
	}

	/** {@inheritDoc} */
    public ISharedObject getSharedObject(IScope scope, String name,
			boolean persistent) {
		synchronized (scope) {
			if (!hasSharedObject(scope, name)) {
				createSharedObject(scope, name, persistent);
			}
			return getSharedObject(scope, name);
		}
	}

	/** {@inheritDoc} */
    public Set<String> getSharedObjectNames(IScope scope) {
		Set<String> result = new HashSet<String>();
		Iterator<String> iter = scope.getBasicScopeNames(TYPE);
		while (iter.hasNext()) {
			result.add(iter.next());
		}
		return result;
	}

	/** {@inheritDoc} */
    public boolean hasSharedObject(IScope scope, String name) {
		return scope.hasChildScope(TYPE, name);
	}

	/** {@inheritDoc} */
    public boolean clearSharedObjects(IScope scope, String name) {
		boolean result = false;
		synchronized (scope) {
			if (hasSharedObject(scope, name)) {
				// '/' clears all local and persistent shared objects associated
				// with the instance
				// if (name.equals('/')) {
				// /foo/bar clears the shared object /foo/bar; if bar is a directory
				// name, no shared objects are deleted.
				// if (name.equals('/')) {
				// /foo/bar/* clears all shared objects stored under the instance
				// directory /foo/bar. The bar directory is also deleted if no
				// persistent shared objects are in use within this namespace.
				// if (name.equals('/')) {
				// /foo/bar/XX?? clears all shared objects that begin with XX,
				// followed by any two characters. If a directory name matches this
				// specification, all the shared objects within this directory are
				// cleared.
				// if (name.equals('/')) {
				// }
				result = ((ISharedObject) scope.getBasicScope(TYPE, name)).clear();
			}
		}
		return result;
	}

}