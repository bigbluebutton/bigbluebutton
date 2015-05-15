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
package org.bigbluebutton.red5.meeting.messaging.red5;

import java.util.Set;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.service.ServiceUtils;
import org.slf4j.Logger;

public class ConnectionInvokerService {
	private static Logger log = Red5LoggerFactory.getLogger(ConnectionInvokerService.class, "bigbluebutton");
	
	private final String CONN = "RED5-";
	
	private static final int NTHREADS = 1;
	private static final Executor exec = Executors.newFixedThreadPool(NTHREADS);
	private static final Executor runExec = Executors.newFixedThreadPool(NTHREADS);
	
	private BlockingQueue<ClientMessage> messages;
	
	private volatile boolean sendMessages = false;
	private IScope bbbAppScope;

	public ConnectionInvokerService() {
		messages = new LinkedBlockingQueue<ClientMessage>();
	}

	public void setAppScope(IScope scope) {
		bbbAppScope = scope;
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
	
	public void sendMessage(final ClientMessage message) {
		messages.offer(message);
	}
	
	private void sendMessageToClient(ClientMessage message) {
		if (message instanceof BroadcastClientMessage) {
			sendBroadcastMessage((BroadcastClientMessage) message);
		} else if (message instanceof DirectClientMessage) {
			sendDirectMessage((DirectClientMessage) message);
		} else if (message instanceof DisconnectClientMessage) {
			handlDisconnectClientMessage((DisconnectClientMessage) message);
		} else if (message instanceof DisconnectAllClientsMessage) {
			handleDisconnectAllClientsMessage((DisconnectAllClientsMessage) message);
		}
	}	

	private void handleDisconnectAllClientsMessage(DisconnectAllClientsMessage msg) {
		IScope meetingScope = getScope(msg.getMeetingId());
		if (meetingScope != null) {
			Set<IConnection> conns = meetingScope.getClientConnections();

			for (IConnection conn : conns) {
				if (conn.isConnected()) {
					String connId = (String) conn.getAttribute("INTERNAL_USER_ID");
					log.info("Disconnecting client=[{}] from meeting=[{}]", connId, msg.getMeetingId());
					conn.close();
				}
			}	
		}		
	}
	
	private void handlDisconnectClientMessage(DisconnectClientMessage msg) {
		IScope meetingScope = getScope(msg.getMeetingId());
		if (meetingScope != null) {
			String sessionId = CONN + msg.getUserId();
			IConnection conn = getConnection(meetingScope, sessionId);
			if (conn != null) {
				if (conn.isConnected()) {
					log.info("Disconnecting user=[{}] from meeting=[{}]", msg.getUserId(), msg.getMeetingId());
					conn.close();
				}
			}				
		}		
	}	
	
	private void sendDirectMessage(final DirectClientMessage msg) {
	  final String sessionId = CONN + msg.getUserID();
		Runnable sender = new Runnable() {
			public void run() {
				IScope meetingScope = getScope(msg.getMeetingID());
				if (meetingScope != null) {
					
					IConnection conn = getConnection(meetingScope, sessionId);
					if (conn != null) {
						if (conn.isConnected()) {
						  log.debug("Sending message=[" + msg.getMessageName() + "] to [" + sessionId 
						      + "] session on meeting=[" + msg.getMeetingID() + "]");
							List<Object> params = new ArrayList<Object>();
							params.add(msg.getMessageName());
							params.add(msg.getMessage());
							ServiceUtils.invokeOnConnection(conn, "onMessageFromServer", params.toArray());
						}
					} else {
					  log.info("Cannot send message=[" + msg.getMessageName() + "] to [" + sessionId 
					      + "] as no such session on meeting=[" + msg.getMeetingID() + "]");
					}
				}	
			}
		};		
	  runExec.execute(sender);
	}
	
	private void sendBroadcastMessage(final BroadcastClientMessage msg) {
		Runnable sender = new Runnable() {
			public void run() {
				IScope meetingScope = getScope(msg.getMeetingID());
				if (meetingScope != null) {
					List<Object> params = new ArrayList<Object>();
					params.add(msg.getMessageName());
					params.add(msg.getMessage());
					ServiceUtils.invokeOnAllScopeConnections(meetingScope, "onMessageFromServer", params.toArray(), null);
				}
			}
		};	
		runExec.execute(sender);
	}
	
	private IConnection getConnection(IScope scope, String userID) {
		Set<IConnection> conns = scope.getClientConnections();
		for (IConnection conn : conns) {
			String connID = (String) conn.getAttribute("USER_SESSION_ID");
			if (connID != null && connID.equals(userID)) {
				return conn;
			}
		}
		
		return null;		
	}
	
	public IScope getScope(String meetingID) {
		if (bbbAppScope != null) {
			return bbbAppScope.getContext().resolveScope("bigbluebutton/" + meetingID);
		} else {
			log.error("BigBlueButton Scope not initialized. No messages are going to the Flash client!");
		}
		
		return null;
	}
	
}
