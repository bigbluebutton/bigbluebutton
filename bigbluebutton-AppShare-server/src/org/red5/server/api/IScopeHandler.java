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

import org.red5.server.api.event.IEventHandler;
import org.red5.server.api.service.IServiceCall;

// TODO: Auto-generated Javadoc
/**
 * The scope handler controls actions performed against a scope object, and also
 * is notified of all events.
 * 
 * Gives fine grained control over what actions can be performed with the can*
 * methods. Allows for detailed reporting on what is happening within the scope
 * with the on* methods. This is the core interface users implement to create
 * applications.
 * 
 * The thread local connection is always available via the Red5 object within
 * these methods
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Luke Hubbard (luke@codegent.com)
 */
public interface IScopeHandler extends IEventHandler {

	/**
	 * Called when a scope is created for the first time.
	 * 
	 * @param scope the new scope object
	 * 
	 * @return <code>true</code> to allow, <code>false</code> to deny
	 */
	boolean start(IScope scope);

	/**
	 * Called just before a scope is disposed.
	 * 
	 * @param scope         Scope that id disposed
	 */
	void stop(IScope scope);

	/**
	 * Called just before every connection to a scope. You can pass additional
	 * params from client using <code>NetConnection.connect</code> method (see
	 * below).
	 * 
	 * @param conn Connection object
	 * @param params List of params passed from client via
	 * <code>NetConnection.connect</code> method. All parameters
	 * but the first one passed to <code>NetConnection.connect</code>
	 * method are available as params array.
	 * @param scope           Scope object
	 * 
	 * @return <code>true</code> to allow, <code>false</code> to deny
	 */
	boolean connect(IConnection conn, IScope scope, Object[] params);

	/**
	 * Called just after the a connection is disconnected.
	 * 
	 * @param conn Connection object
	 * @param scope Scope object
	 */
	void disconnect(IConnection conn, IScope scope);

	/**
	 * Called just before a child scope is added.
	 * 
	 * @param scope Scope that will be added
	 * 
	 * @return <code>true</code> to allow, <code>false</code> to deny
	 */
	boolean addChildScope(IBasicScope scope);

	/**
	 * Called just after a child scope has been removed.
	 * 
	 * @param scope Scope that has been removed
	 */
	void removeChildScope(IBasicScope scope);

	/**
	 * Called just before a client enters the scope.
	 * 
	 * @param client Client object
	 * @param scope      Scope that is joined by client
	 * 
	 * @return <code>true</code> to allow, <code>false</code> to deny
	 * connection
	 */
	boolean join(IClient client, IScope scope);

	/**
	 * Called just after the client leaves the scope.
	 * 
	 * @param client Client object
	 * @param scope Scope object
	 */
	void leave(IClient client, IScope scope);

	/**
	 * Called when a service is called.
	 * 
	 * @param conn The connection object
	 * @param call The call object.
	 * 
	 * @return <code>true</code> to allow, <code>false</code> to deny
	 */
	boolean serviceCall(IConnection conn, IServiceCall call);

}
