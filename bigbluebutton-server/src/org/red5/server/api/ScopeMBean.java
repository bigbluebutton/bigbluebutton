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
import java.util.Set;

// TODO: Auto-generated Javadoc
/**
 * The scope object.
 * 
 * A statefull object shared between a group of clients connected to the same
 * <tt>context path</tt>. Scopes are arranged in hierarchical way, so its possible for
 * a scope to have a parent and children scopes. If a client connects to a scope then they are
 * also connected to its parent scope. The scope object is used to access
 * resources, shared object, streams, etc. That is, scope are general option for grouping things
 * in application.
 * 
 * The following are all names for scopes: application, room, place, lobby.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface ScopeMBean {

	/** ID constant. */
	public static final String ID = "red5.scope";

	/** Type constant. */
	public static final String TYPE = "scope";

	/** Scope separator. */
	public static final String SEPARATOR = ":";

	/**
	 * Check to see if this scope has a child scope matching a given name.
	 * 
	 * @param name the name of the child scope
	 * 
	 * @return <code>true</code> if a child scope exists, otherwise
	 * <code>false</code>
	 */
	public boolean hasChildScope(String name);

	/**
	 * Checks whether scope has a child scope with given name and type.
	 * 
	 * @param type Child scope type
	 * @param name Child scope name
	 * 
	 * @return <code>true</code> if a child scope exists, otherwise
	 * <code>false</code>
	 */
	public boolean hasChildScope(String type, String name);

	/**
	 * Creates child scope with name given and returns success value. Returns
	 * <code>true</code> on success, <code>false</code> if given scope
	 * already exists among children.
	 * 
	 * @param name New child scope name
	 * 
	 * @return <code>true</code> if child scope was successfully creates,
	 * <code>false</code> otherwise
	 */
	public boolean createChildScope(String name);

	/**
	 * Adds scope as a child scope. Returns <code>true</code> on success,
	 * <code>false</code> if given scope is already a child of current.
	 * 
	 * @param scope Scope given
	 * 
	 * @return <code>true</code> if child scope was successfully added,
	 * <code>false</code> otherwise
	 */
	public boolean addChildScope(IBasicScope scope);

	/**
	 * Removes scope from the children scope list. Returns <code>false</code>
	 * if given scope isn't a child of the current scope.
	 * 
	 * @param scope Scope given
	 */
	public void removeChildScope(IBasicScope scope);

	/**
	 * Get a set of the child scope names.
	 * 
	 * @return set containing child scope names
	 */
	public Iterator<String> getScopeNames();

	/**
	 * Gets the basic scope names.
	 * 
	 * @param type the type
	 * 
	 * @return the basic scope names
	 */
	public Iterator<String> getBasicScopeNames(String type);

	/**
	 * Get a child scope by name.
	 * 
	 * @param name Name of the child scope
	 * @param type     Child scope type
	 * 
	 * @return the child scope, or null if no scope is found
	 */
	public IBasicScope getBasicScope(String type, String name);

	/**
	 * Return scope by name.
	 * 
	 * @param name     Scope name
	 * 
	 * @return         Scope with given name
	 */
	public IScope getScope(String name);

	/**
	 * Get a set of connected clients. You can get the connections by passing
	 * the scope to the clients {@link IClient#getConnections()} method.
	 * 
	 * @return Set containing all connected clients
	 * 
	 * @see org.red5.server.api.IClient#getConnections(IScope)
	 */
	public Set<IClient> getClients();

	/**
	 * Get a connection iterator. You can call remove, and the connection will
	 * be closed.
	 * 
	 * @return Iterator holding all connections
	 */
	public Iterator<IConnection> getConnections();

	/**
	 * Lookup connections.
	 * 
	 * @param client object
	 * 
	 * @return Set of connection objects (readonly)
	 */
	public Set<IConnection> lookupConnections(IClient client);

	/**
	 * Returns scope context.
	 * 
	 * @return Scope context
	 */
	public IContext getContext();

	/**
	 * Checks whether scope has handler or not.
	 * 
	 * @return <code>true</code> if scope has a handler, <code>false</code>
	 * otherwise
	 */
	public boolean hasHandler();

	/**
	 * Return handler of the scope.
	 * 
	 * @return Scope handler
	 */
	public IScopeHandler getHandler();

	/**
	 * Return context path.
	 * 
	 * @return Context path
	 */
	public String getContextPath();

	/**
	 * Adds given connection to the scope.
	 * 
	 * @param conn Given connection
	 * 
	 * @return <code>true</code> on success, <code>false</code> if given
	 * connection already belongs to this scope
	 */
	public boolean connect(IConnection conn);

	/**
	 * Add given connection to the scope, overloaded for parameters pass case.
	 * 
	 * @param conn             Given connection
	 * @param params           Parameters passed
	 * 
	 * @return                 <code>true</code> on success, <code>false</code> if given
	 * connection already belongs to this scope
	 */
	public boolean connect(IConnection conn, Object[] params);

	/**
	 * Removes given connection from list of scope connections. This disconnects
	 * all clients of given connection from the scope.
	 * 
	 * @param conn Connection given
	 */
	public void disconnect(IConnection conn);

}
