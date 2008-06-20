package org.red5.tutorials.clientlist;

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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.red5.samples.components.ClientManager;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.service.ServiceUtils;

/**
 * Sample application that uses the client manager.
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Joachim Bauch (jojo@struktur.de)
 * @see org.red5.samples.components.ClientManager
 */
public class Application extends ApplicationAdapter {

	protected static Logger log = LoggerFactory.getLogger(Application.class);

	/** Manager for the clients. */
	private ClientManager clientMgr = new ClientManager("clientlist", false);

	/** {@inheritDoc} */
    @Override
	public boolean connect(IConnection conn, IScope scope, Object[] params) {
		// Check if the user passed valid parameters.
		if (params == null || params.length == 0) {
			log.debug("Client didn't pass a username.");
			// NOTE: "rejectClient" terminates the execution of the current method!
			rejectClient("No username passed.");
		}

		// Call original method of parent class.
		if (!super.connect(conn, scope, params)) {
			return false;
		}

		String username = params[0].toString();
		String uid = conn.getClient().getId();
		if (log.isDebugEnabled()) {
			log.debug("Client \"{}\" ({}) connected.", new Object[]{username, uid});
		}
		// Register the user in the shared object.
		clientMgr.addClient(scope, username, uid);
		// Notify client about unique id.
		ServiceUtils.invokeOnConnection(conn, "setClientID",
				new Object[] { uid });
		return true;
	}

	/** {@inheritDoc} */
    @Override
	public void disconnect(IConnection conn, IScope scope) {
		// Get the previously stored username.
		String uid = conn.getClient().getId();
		// Unregister user.
		String username = clientMgr.removeClient(scope, uid);
		if (log.isDebugEnabled()) {
			if (username != null) {
			    log.debug("Client \"{}\" ({}) disconnected.", new Object[]{username, uid});
			} else {
			    log.debug("Client ({}) disconnected.", uid);
			}
		}
		// Call original method of parent class.
		super.disconnect(conn, scope);
	}

}
