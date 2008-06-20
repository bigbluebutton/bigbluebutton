package org.red5.webapps.admin.client;

/*
 * RED5 Open Source Flash Server - http://www.osflash.org/red5
 * 
 * Copyright (c) 2006-2008 by respective authors (see below). All rights reserved.
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

import java.util.ArrayList;
import java.util.HashMap;

import org.acegisecurity.BadCredentialsException;
import org.acegisecurity.providers.ProviderManager;
import org.acegisecurity.providers.UsernamePasswordAuthenticationToken;
import org.red5.server.ClientRegistry;
import org.red5.server.api.IClient;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.exception.ClientNotFoundException;
import org.red5.server.exception.ClientRejectedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Martijn van Beek (martijn.vanbeek@gmail.com)
 */
public class AuthClientRegistry extends ClientRegistry {

	protected static Logger log = LoggerFactory
			.getLogger(AuthClientRegistry.class);

	protected IScope masterScope;

	protected IClient client;

	public AuthClientRegistry() {
		super();
	}

	@Override
	public IClient newClient(Object[] params) throws ClientNotFoundException,
			ClientRejectedException {

		if (params == null || params.length == 0) {
			log.warn("Client didn't pass a username.");
			throw new ClientRejectedException();
		}

		String username, passwd;
		if (params[0] instanceof HashMap) { // Win FP sends HashMap
			HashMap userWin = (HashMap) params[0];
			username = (String) userWin.get(0);
			passwd = (String) userWin.get(1);
		} else if (params[0] instanceof ArrayList) { // Mac FP sends
														// ArrayList
			ArrayList userMac = (ArrayList) params[0];
			username = (String) userMac.get(0);
			passwd = (String) userMac.get(1);
		} else {
			throw new ClientRejectedException();
		}

		UsernamePasswordAuthenticationToken t = new UsernamePasswordAuthenticationToken(
				username, passwd);

		masterScope = Red5.getConnectionLocal().getScope();
		ProviderManager mgr = (ProviderManager) masterScope.getContext()
				.getBean("authenticationManager");
		try {
			t = (UsernamePasswordAuthenticationToken) mgr.authenticate(t);
		} catch (BadCredentialsException ex) {
			throw new ClientRejectedException();
		}
		if (t.isAuthenticated()) {
			client = new AuthClient(nextId(), this);

			addClient(client);
			client.setAttribute("authInformation", t);
			log.debug("Authenticated client - username: {}, id: {}",
					new Object[] { username, client.getId() });
		}

		return client;
	}
}