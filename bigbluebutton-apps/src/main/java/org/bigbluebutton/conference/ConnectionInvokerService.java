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

import java.util.Iterator;
import java.util.Set;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;

import org.red5.server.api.IConnection;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.scope.ScopeType;
import org.red5.server.api.service.ServiceUtils;

public class ConnectionInvokerService {

	private static final int NTHREADS = 1;
	private static final Executor exec = Executors.newFixedThreadPool(NTHREADS);
			
	private BlockingQueue<ClientMessage> messages;
	
	private ConcurrentHashMap<String, IConnection> connections;
	private ConcurrentHashMap<String, IScope> scopes;
	
	private volatile boolean sendMessages = false;
	private IScope bbbAppScope;

	public ConnectionInvokerService() {
		messages = new LinkedBlockingQueue<ClientMessage>();

		connections = new ConcurrentHashMap<String, IConnection>();
		scopes = new ConcurrentHashMap<String, IScope>();
	}

	public void setAppScope(IScope scope) {
		bbbAppScope = scope;
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
	
	public void start() {
		sendMessages = true;
		Runnable sender = new Runnable() {
			public void run() {
				while (sendMessages) {
					ClientMessage message;
					try {
						message = messages.take();
						sendMessageToClient(message);	
					} catch (InterruptedException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
									
				}
			}
		};
		exec.execute(sender);		
	}
	
	public void stop() {
		sendMessages = false;
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
		messages.offer(message);
	}
	
	private void sendMessageToClient(ClientMessage message) {
	
		if (message.getType().equals(ClientMessage.BROADCAST)) {
			
			IScope meetingScope = bbbAppScope.getContext().resolveScope("bigbluebutton/" + message.getDest());
			if (meetingScope != null) {
				System.out.println("***** Found scope [" + meetingScope.getName() + "] meetingID=[" + message.getDest() + "]");
				
				getConnections(meetingScope);
				
				if (meetingScope.hasChildScope(ScopeType.SHARED_OBJECT, "presentationSO")) {
					System.out.println("**** Meeting has Presentation shared object.");
				}
			}
			
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

	private void getConnections(IScope scope) {
		Set<IConnection> conns = scope.getClientConnections();

		for (IConnection conn : conns) {
			String connID = (String) conn.getAttribute("INTERNAL_USER_ID");
			System.out.println("**** ConnID=[" + connID + "]");
		}
	}
}
