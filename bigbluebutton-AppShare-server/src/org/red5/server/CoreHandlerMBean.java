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

import org.red5.server.api.IBasicScope;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.service.IServiceCall;

// TODO: Auto-generated Javadoc
/**
 * Base IScopeHandler implementation.
 * 
 * @author The Red5 Project (red5@osflash.org)
 */
public interface CoreHandlerMBean {

	/**
	 * Connect.
	 * 
	 * @param conn the conn
	 * @param scope the scope
	 * 
	 * @return true, if successful
	 */
	public boolean connect(IConnection conn, IScope scope);

	/**
	 * Connect.
	 * 
	 * @param conn the conn
	 * @param scope the scope
	 * @param params the params
	 * 
	 * @return true, if successful
	 */
	public boolean connect(IConnection conn, IScope scope, Object[] params);

	/**
	 * Disconnect.
	 * 
	 * @param conn the conn
	 * @param scope the scope
	 */
	public void disconnect(IConnection conn, IScope scope);

	/**
	 * Join.
	 * 
	 * @param client the client
	 * @param scope the scope
	 * 
	 * @return true, if successful
	 */
	public boolean join(IClient client, IScope scope);

	/**
	 * Leave.
	 * 
	 * @param client the client
	 * @param scope the scope
	 */
	public void leave(IClient client, IScope scope);

	/**
	 * Removes the child scope.
	 * 
	 * @param scope the scope
	 */
	public void removeChildScope(IBasicScope scope);

	/**
	 * Service call.
	 * 
	 * @param conn the conn
	 * @param call the call
	 * 
	 * @return true, if successful
	 */
	public boolean serviceCall(IConnection conn, IServiceCall call);

	/**
	 * Start.
	 * 
	 * @param scope the scope
	 * 
	 * @return true, if successful
	 */
	public boolean start(IScope scope);

	/**
	 * Stop.
	 * 
	 * @param scope the scope
	 */
	public void stop(IScope scope);

	/**
	 * Handle event.
	 * 
	 * @param event the event
	 * 
	 * @return true, if successful
	 */
	public boolean handleEvent(IEvent event);

}
