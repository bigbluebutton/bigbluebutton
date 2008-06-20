package org.red5.webapps.admin;

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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.red5.samples.components.ClientManager;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.ScopeUtils;

/**
 * Admin Panel for Red5 Server
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Martijn van Beek (martijn.vanbeek@gmail.com)
 */
public class Application extends ApplicationAdapter {

	protected static Logger log = LoggerFactory.getLogger(Application.class);

	/** Manager for the clients. */
	private ClientManager clientMgr = new ClientManager("clientlist", false);

	private IScope scope;

	private HashMap<Integer, String> scopes;

	private int scope_id = 0;

	@Override
	public boolean appStart(IScope app) {
		log.info("Admin application started");
		return true;
	}

	/** {@inheritDoc} */
	@Override
	public boolean connect(IConnection conn, IScope scope, Object[] params) {
		this.scope = scope;
		/*
		 * String id = conn.getSessionId();
		 * 
		 * IScope connectionScope = Red5.getConnectionLocal().getScope();
		 * 
		 * IClientRegistry clientRegistry = connectionScope.getContext()
		 * .getClientRegistry();
		 * 
		 * IClient client = clientRegistry.hasClient(id) ? clientRegistry
		 * .lookupClient(id) : clientRegistry.newClient(params);
		 * conn.initialize(client);
		 */
		return true;
	}

	/**
	 * Get all running applications
	 * 
	 * @return HashMap containing all applications
	 */
	public HashMap getApplications() {
		IScope root = ScopeUtils.findRoot(scope);
		Iterator<String> iter = root.getScopeNames();
		HashMap<Integer, Object> apps = new HashMap<Integer, Object>();
		int id = 0;
		while (iter.hasNext()) {
			String name = iter.next();
			String name2 = name.substring(1, name.length());
			int size = getConnections(name2).size();
			HashMap<String, String> app = new HashMap<String, String>();
			app.put("name", name2);
			app.put("clients", size + "");
			apps.put(id, app);
			id++;
		}
		return apps;
	}

	/**
	 * Get Application statistics.
	 * 
	 * @param scopeName
	 * @return HashMap with the statistics
	 */
	public HashMap getStatistics(String scopeName) {
		ScopeStatistics scopestats = new ScopeStatistics();
		return scopestats.getStats(getScope(scopeName));
	}

	/**
	 * Get Client statistics
	 * 
	 * @param userid
	 * @return HashMap with the statistics
	 */
	public HashMap getUserStatistics(String userid) {
		UserStatistics userstats = new UserStatistics();
		return userstats.getStats(userid, scope);
	}

	/**
	 * Get all the scopes
	 * 
	 * @param scopeName
	 * @return HashMap containing all the scopes
	 */
	public HashMap getScopes(String scopeName) {
		IScope root = ScopeUtils.findRoot(scope);
		IScope scopeObj = root.getScope(scopeName);
		scopes = new HashMap<Integer, String>();
		try {
			getRooms(scopeObj, 0);
		} catch (java.lang.NullPointerException npe) {
			log.debug(npe.toString());
		}
		return scopes;
	}

	/**
	 * Get all the scopes
	 * 
	 * @param root
	 *            the scope to from
	 * @param depth
	 *            scope depth
	 */
	public void getRooms(IScope root, int depth) {
		Iterator<String> iter = root.getScopeNames();
		String indent = "";
		for (int i = 0; i < depth; i++) {
			indent += " ";
		}
		while (iter.hasNext()) {
			String name = iter.next();
			String name2 = name.substring(1, name.length());
			try {
				IScope parent = root.getScope(name2);
				// parent.
				getRooms(parent, depth + 1);
				scopes.put(scope_id, indent + name2);
				scope_id++;
				// log.info("Found scope: "+name2);
			} catch (java.lang.NullPointerException npe) {
				log.debug(npe.toString());
			}
		}
	}

	/**
	 * Get all the connections (clients)
	 * 
	 * @param scopeName
	 * @return HashMap with all clients in the given scope
	 */
	public HashMap getConnections(String scopeName) {
		HashMap<Integer, String> connections = new HashMap<Integer, String>();
		IScope root = getScope(scopeName);
		if (root != null) {
			Set<IClient> clients = root.getClients();
			Iterator<IClient> client = clients.iterator();
			int id = 0;
			while (client.hasNext()) {
				IClient c = client.next();
				String user = c.getId();
				connections.put(id, user);
				id++;
			}
		}
		return connections;
	}

	/**
	 * Kill a client
	 * 
	 * @param userid
	 */
	public void killUser(String userid) {
		IScope root = ScopeUtils.findRoot(scope);
		Set<IClient> clients = root.getClients();
		Iterator<IClient> client = clients.iterator();
		while (client.hasNext()) {
			IClient c = client.next();
			if (c.getId().equals(userid)) {
				c.disconnect();
			}
		}
	}

	/**
	 * Get an scope by name
	 * 
	 * @param scopeName
	 * @return IScope the requested scope
	 */
	private IScope getScope(String scopeName) {
		IScope root = ScopeUtils.findRoot(scope);
		return getScopes(root, scopeName);
	}

	/**
	 * Search through all the scopes in the given scope to a scope with the
	 * given name
	 * 
	 * @param root
	 * @param scopeName
	 * @return IScope the requested scope
	 */
	private IScope getScopes(IScope root, String scopeName) {
		// log.info("Found scope "+root.getName());
		if (root.getName().equals(scopeName)) {
			return root;
		} else {
			Iterator<String> iter = root.getScopeNames();
			while (iter.hasNext()) {
				String name = iter.next();
				String name2 = name.substring(1, name.length());
				try {
					IScope parent = root.getScope(name2);
					IScope scope = getScopes(parent, scopeName);
					if (scope != null) {
						return scope;
					}
				} catch (java.lang.NullPointerException npe) {
					log.debug(npe.toString());
				}
			}
		}
		return null;
	}

	/** {@inheritDoc} */
	@Override
	public void disconnect(IConnection conn, IScope scope) {
		// Get the previously stored username.
		String rid = conn.getClient().getId();
		// Unregister user.
		// String uid = clientMgr.removeClient(scope, rid);
		log.info("Client with id {} disconnected.", rid);
		super.disconnect(conn, scope);
	}

	/**
	 * Get the root scope
	 * 
	 * @return IScope
	 */
	public IScope getScope() {
		return scope;
	}
}