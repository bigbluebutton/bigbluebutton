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

import org.red5.webapps.admin.utils.Utils;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.ScopeUtils;

/**
 * 
 * @author The Red5 Project (red5@osflash.org)
 * @author Martijn van Beek (martijn.vanbeek@gmail.com)
 */
class UserStatistics {
	private HashMap<Integer, Object> apps;

	private int id;

	public void UserStatistics() {
	}

	public HashMap getStats(String userid, IScope scope) {
		apps = new HashMap();
		id = 0;
		IScope root = ScopeUtils.findRoot(scope);
		Set<IClient> clients = root.getClients();
		Iterator<IClient> client = clients.iterator();
		extractConnectionData(root);
		addData("User attributes", "--");
		while (client.hasNext()) {
			IClient c = client.next();
			if (c.getId().equals(userid)) {
				Set<String> names = c.getAttributeNames();
				Iterator<String> itnames = names.iterator();
				while (itnames.hasNext()) {
					String key = itnames.next();
					addData(key, c.getAttribute(key));
				}
				addData("Created", Utils.formatDate(c.getCreationTime()));
			}
		}
		return apps;
	}

	protected void addData(String name, Object value) {
		HashMap<String, Object> app = new HashMap();
		app.put("name", name);
		app.put("value", value.toString());
		apps.put(id, app);
		id++;
	}

	protected void extractConnectionData(IScope root) {
		Iterator<IConnection> conn = root.getConnections();
		while (conn.hasNext()) {
			IConnection connection = conn.next();
			addData("Scope statistics", "--");
			addData("Send bytes", Utils.formatBytes(connection
					.getWrittenBytes()));
			addData("Received bytes", Utils.formatBytes(connection
					.getReadBytes()));
			addData("Send messages", connection.getWrittenMessages());
			addData("Received messages", connection.getReadMessages());
			addData("Dropped messages", connection.getDroppedMessages());
			addData("Pending messages", connection.getPendingMessages());
			addData("Remote address", connection.getRemoteAddress() + ":"
					+ connection.getRemotePort() + " (" + connection.getHost()
					+ ")");
			addData("Path", connection.getPath());
		}
	}
}