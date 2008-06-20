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
import org.red5.server.api.IClientRegistry;
import org.red5.server.api.IConnection;
import org.red5.server.api.IContext;
import org.red5.server.api.IScope;
import org.red5.server.api.IScopeHandler;
import org.red5.server.api.Red5;
import org.red5.server.api.event.IEvent;
import org.red5.server.api.service.IServiceCall;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// TODO: Auto-generated Javadoc
/**
 * Base IScopeHandler implementation.
 */
public class CoreHandler implements IScopeHandler, CoreHandlerMBean {

	/** The log. */
	protected static Logger log = LoggerFactory.getLogger(CoreHandler.class);

	/** {@inheritDoc} */
    public boolean addChildScope(IBasicScope scope) {
		return true;
	}

    /**
     * Connects client to the scope.
     * 
     * @param conn                 Client conneciton
     * @param scope                Scope
     * 
     * @return                     true if client was registred within scope, false otherwise
     */
    public boolean connect(IConnection conn, IScope scope) {
		return connect(conn, scope, null);
	}

    /**
     * Connects client to the scope.
     * 
     * @param conn                  Client conneciton
     * @param scope                 Scope
     * @param params                Params passed from client side with connect call
     * 
     * @return                      true if client was registred within scope, false otherwise
     */
    public boolean connect(IConnection conn, IScope scope, Object[] params) {
		log.debug("Connect to core handler ?");

        // Get session id
        String id = conn.getSessionId();
        //log.debug("Session id: {}", id);

		// Use client registry from scope the client connected to.
		IScope connectionScope = Red5.getConnectionLocal().getScope();
		log.debug("Connection scope: {}", (connectionScope == null ? "is null" : "not null"));

        // when the scope is null bad things seem to happen, if a null scope is OK then 
        // this block will need to be removed - Paul
        if (connectionScope == null) {
            return false;
        }

        // Get client registry for connection scope
        IClientRegistry clientRegistry = connectionScope.getContext().getClientRegistry();
		log.debug("Client registry: {}", (clientRegistry == null ? "is null" : "not null"));

        // Get client from registry by id or create a new one
        IClient client = clientRegistry.hasClient(id) ? clientRegistry.lookupClient(id) : clientRegistry.newClient(params);

		// We have a context, and a client object.. time to init the connection.
		conn.initialize(client);

		// we could checked for banned clients here 
		return true;
	}

	/** {@inheritDoc} */
    public void disconnect(IConnection conn, IScope scope) {
		// do nothing here
	}

	/** {@inheritDoc} */
    public boolean join(IClient client, IScope scope) {
		return true;
	}

	/** {@inheritDoc} */
    public void leave(IClient client, IScope scope) {
		// do nothing here
	}

	/** {@inheritDoc} */
    public void removeChildScope(IBasicScope scope) {
		// do nothing here
	}

    /**
     * Remote method invokation.
     * 
     * @param conn         Connection to invoke method on
     * @param call         Service call context
     * 
     * @return             true on success
     */
    public boolean serviceCall(IConnection conn, IServiceCall call) {
		final IContext context = conn.getScope().getContext();
		if (call.getServiceName() != null) {
			context.getServiceInvoker().invoke(call, context);
		} else {
			context.getServiceInvoker().invoke(call,
					conn.getScope().getHandler());
		}
		return true;
	}

	/** {@inheritDoc} */
    public boolean start(IScope scope) {
		return true;
	}

	/** {@inheritDoc} */
    public void stop(IScope scope) {
		// do nothing here
	}

	/** {@inheritDoc} */
    public boolean handleEvent(IEvent event) {
		return false;
	}

}
