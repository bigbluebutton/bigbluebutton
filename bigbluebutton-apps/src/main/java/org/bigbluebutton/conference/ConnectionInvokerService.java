/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.conference;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import org.red5.server.api.IConnection;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.service.ServiceUtils;

public class ConnectionInvokerService {

	private static final int NTHREADS = 4;
	private static final Executor exec = Executors.newFixedThreadPool(NTHREADS);
			
//	private ConcurrentLinkedQueue<ClientMessage> messages;
	
	private ConcurrentHashMap<String, IConnection> connections;
	private ConcurrentHashMap<String, IScope> scopes;
	
	public ConnectionInvokerService() {
//		messages = new ConcurrentLinkedQueue<ClientMessage>();
		System.out.print("Starting conn invoket service!!!!");
		connections = new ConcurrentHashMap<String, IConnection>();
		scopes = new ConcurrentHashMap<String, IScope>();
	}
	
	public void addConnection(String id, IConnection conn) {
		if (connections == null) {
			System.out.println("Connections is null!!!!");
			return;
		}
		if (id == null) {
			System.out.println("CONN ID IS NULL!!!");
			
		}
		if (conn == null) {
			System.out.println("CONN IS NULL");
		}
		connections.putIfAbsent(id, conn);
	}
	
	public void removeConnection(String id) {
		connections.remove(id);
	}
	
	public void addScope(String id, IScope scope) {
		scopes.putIfAbsent(id, scope);
	}
	
	public void removeScope(String id) {
		scopes.remove(id);
	}
	
	public void sendMessage(final ClientMessage message) {
		Runnable sender = new Runnable() {
			public void run() {
				sendMessageToClient(message);
			}
		};
		exec.execute(sender);
	}
	
	private void sendMessageToClient(ClientMessage message) {
		if (message.getType().equals(ClientMessage.BROADCAST)) {
			IScope scope = scopes.get(message.getDest());
			if (scope != null) {
				List<Object> params = new ArrayList<Object>();
				params.add(message.getMessageName());
				params.add(message.getMessage());
				ServiceUtils.invokeOnAllScopeConnections(scope, "onMessageFromServer", params.toArray(), null);				
			}
		} else if (message.getType().equals(ClientMessage.DIRECT)) {
			IConnection conn = connections.get(message.getDest());
			if (conn != null) {
				if (conn.isConnected()) {
					List<Object> params = new ArrayList<Object>();
					params.add(message.getMessageName());
					params.add(message.getMessage());
					ServiceUtils.invokeOnConnection(conn, "onMessageFromServer", params.toArray());
				}
			}
		}
	}
	
}
