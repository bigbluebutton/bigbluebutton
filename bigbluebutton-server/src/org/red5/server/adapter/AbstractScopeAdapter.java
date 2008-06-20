package org.red5.server.adapter;

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
import org.red5.server.api.IScopeHandler;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.service.IServiceCall;

// TODO: Auto-generated Javadoc
/**
 * Base scope handler implementation. Mean to be subclassed.
 */
public abstract class AbstractScopeAdapter implements IScopeHandler {
    
    /** Can start flag. <code>true</code> if scope is ready to be activated, <code>false</code> otherwise */
	private boolean canStart = true;
    
    /** Can connect flag. <code>true</code> if connections to scope are allowed, <code>false</code> otherwise */
	private boolean canConnect = true;
    
    /** Can join flag. <code>true</code> if scope may be joined by users, <code>false</code> otherwise */
	private boolean canJoin = true;
    
    /** Can call service flag. <code>true</code> if remote service calls are allowed for the scope, <code>false</code> otherwise */
	private boolean canCallService = true;
    
    /** Can add child scope flag. <code>true</code> if scope is allowed to add child scopes, <code>false</code> otherwise */
	private boolean canAddChildScope = true;

    /** Can handle event flag. <code>true</code> if events handling is allowed, <code>false</code> otherwise */
    private boolean canHandleEvent = true;

	/**
	 * Setter for can start flag.
	 * 
	 * @param canStart  <code>true</code> if scope is ready to be activated, <code>false</code> otherwise
	 */
    public void setCanStart(boolean canStart) {
		this.canStart = canStart;
	}

	/**
	 * Setter for can call service flag.
	 * 
	 * @param canCallService <code>true</code> if remote service calls are allowed for the scope, <code>false</code> otherwise
	 */
    public void setCanCallService(boolean canCallService) {
		this.canCallService = canCallService;
	}

	/**
	 * Setter for can connect flag.
	 * 
	 * @param canConnect <code>true</code> if connections to scope are allowed, <code>false</code> otherwise
	 */
    public void setCanConnect(boolean canConnect) {
		this.canConnect = canConnect;
	}

	/**
	 * Setter for 'can join' flag.
	 * 
	 * @param canJoin <code>true</code> if scope may be joined by users, <code>false</code> otherwise
	 */
    public void setJoin(boolean canJoin) {
		this.canJoin = canJoin;
	}

	/** {@inheritDoc} */
    public boolean start(IScope scope) {
		return canStart;
	}

	/** {@inheritDoc} */
    public void stop(IScope scope) {
		// nothing
	}

	/** {@inheritDoc} */
    public boolean connect(IConnection conn, IScope scope, Object[] params) {
		return canConnect;
	}

	/** {@inheritDoc} */
    public void disconnect(IConnection conn, IScope scope) {
		// nothing
	}

	/** {@inheritDoc} */
    public boolean join(IClient client, IScope scope) {
		return canJoin;
	}

	/** {@inheritDoc} */
    public void leave(IClient client, IScope scope) {
		// nothing
	}

	/** {@inheritDoc} */
    public boolean serviceCall(IConnection conn, IServiceCall call) {
		return canCallService;
	}

	/** {@inheritDoc} */
    public boolean addChildScope(IBasicScope scope) {
		return canAddChildScope;
	}

	/** {@inheritDoc} */
    public void removeChildScope(IBasicScope scope) {
		// TODO Auto-generated method stub	
	}

	/** {@inheritDoc} */
    public boolean handleEvent(IEvent event) {
		return canHandleEvent;
	}

}