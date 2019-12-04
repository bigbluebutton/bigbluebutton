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
package org.bigbluebutton.app.screenshare.red5;

import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.scope.ScopeType;
import org.red5.server.api.service.ServiceUtils;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.api.so.ISharedObjectService;
import org.red5.server.so.SharedObjectService;
import org.red5.server.util.ScopeUtils;
import org.slf4j.Logger;
import com.google.gson.Gson;

public class ConnectionInvokerService {
  private static Logger log = Red5LoggerFactory.getLogger(ConnectionInvokerService.class, "screenshare");

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
    } else if (message instanceof SharedObjectClientMessage) {
      sendSharedObjectMessage((SharedObjectClientMessage) message);
    } else if (message instanceof DisconnectClientMessage) {
      handlDisconnectClientMessage((DisconnectClientMessage) message);
    } else if (message instanceof DisconnectAllClientsMessage) {
      handleDisconnectAllClientsMessage((DisconnectAllClientsMessage) message);
    } else if (message instanceof CloseConnectionMessage) {
      handleCloseConnectionMessage((CloseConnectionMessage) message);
    }
  }

  private void handleCloseConnectionMessage(CloseConnectionMessage msg) {
		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", msg.meetingId);
		logData.put("connId", msg.connId);
		logData.put("streamId", msg.streamId);
		logData.put("scope", msg.scope);
		logData.put("event", "unauth_publish_stream_bbb_screenshare");
		logData.put("description", "Unauthorized publish stream.");

		Gson gson = new Gson();
		String logStr =  gson.toJson(logData);
		log.info(logStr);

		IScope meetingScope = null;

		if (bbbAppScope.getName().equals(msg.scope)) {
			meetingScope = bbbAppScope;
		} else {
			meetingScope = getScope(msg.scope);
		}

		if (meetingScope != null) {
			IConnection conn = getConnectionWithConnId(meetingScope, msg.connId);
			if (conn != null) {
				if (conn.isConnected()) {
					log.info("Disconnecting connection. data={}", logStr);
					conn.close();
				}
			}
		}

	}

  private void handleDisconnectAllClientsMessage(DisconnectAllClientsMessage msg) {
    IScope meetingScope = getScope(msg.getMeetingId());
    if (meetingScope != null) {
      Set<IConnection> conns = meetingScope.getClientConnections();

      for (IConnection conn : conns) {
        if (conn.isConnected()) {
          String connId = (String) conn.getAttribute("USERID");
          log.info("Disconnecting client=[{}] from meeting=[{}]", connId, msg.getMeetingId());
          conn.close();
        }
      }	
    }		
  }

  private void handlDisconnectClientMessage(DisconnectClientMessage msg) {
    IScope meetingScope = getScope(msg.getMeetingId());
    if (meetingScope != null) {
      IConnection conn = getConnection(meetingScope, msg.getUserId());
      if (conn != null) {
        if (conn.isConnected()) {
          log.info("Disconnecting user=[{}] from meeting=[{}]", msg.getUserId(), msg.getMeetingId());
          conn.close();
        }
      }
    }
  }

  private void sendSharedObjectMessage(SharedObjectClientMessage msg) {
    System.out.println("*********** Request to send [" + msg.getMessageName() + "] using shared object.");

    IScope meetingScope = getScope(msg.getMeetingID());
    if (meetingScope != null) {
      if (meetingScope.hasChildScope(ScopeType.SHARED_OBJECT, msg.getSharedObjectName())) {
        ISharedObject so = getSharedObject(meetingScope, msg.getSharedObjectName());
        if (so != null) {
          System.out.println("*********** Sending [" + msg.getMessageName() + "] using shared object.");
          so.sendMessage(msg.getMessageName(), msg.getMessage());
        } else {
          System.out.println("**** Cannot get SO for [" + msg.getSharedObjectName() + "]");
        }
      } else {
        System.out.println("**** No SO scope for [" + msg.getSharedObjectName() + "]");
      }
    } else {
      System.out.println("**** No Meeting scope for [" + msg.getMeetingID() + "]");
    }
  }

  private void sendDirectMessage(final DirectClientMessage msg) {
    Runnable sender = new Runnable() {
      public void run() {
        IScope meetingScope = getScope(msg.getMeetingID());
        if (meetingScope != null) {
          //log.debug("Found scope =[{}] for meeting=[{}]", meetingScope.getName(), msg.getMeetingID());
          IConnection conn = getConnection(meetingScope, msg.getUserID());
          if (conn != null) {
            if (conn.isConnected()) {
              List<Object> params = new ArrayList<Object>();
              params.add(msg.getMessageName());
              params.add(msg.getMessage());
              //log.debug("Sending message=[{}] to meeting=[{}]", msg.getMessageName(), msg.getMeetingID());
              ServiceUtils.invokeOnConnection(conn, "onMessageFromServer", params.toArray());
            } else {
              log.warn("Connection not connected for userid=[{}] in meeting=[{}]", msg.getUserID(), msg.getMeetingID());
            }
          }	else {
            log.warn("No connection for userid=[{}] in meeting=[{}]", msg.getUserID(), msg.getMeetingID());
          }
        } else {
          log.error("Failed to find scope for meeting=[{}]", msg.getMeetingID());
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

	private IConnection getConnectionWithConnId(IScope scope, String connId) {
		Set<IConnection> conns = scope.getClientConnections();
		for (IConnection conn : conns) {
			String connID = (String) conn.getSessionId();
			if (connID != null && connID.equals(connId)) {
				return conn;
			}
		}

		return null;
	}

  private IConnection getConnection(IScope scope, String userID) {
    Set<IConnection> conns = scope.getClientConnections();
    for (IConnection conn : conns) {
      String connID = (String) conn.getAttribute("USERID");
      if (connID != null && connID.equals(userID)) {
        return conn;
      }
    }

    return null;
  }

  public IScope getScope(String meetingID) {
    if (bbbAppScope != null) {
      return bbbAppScope.getContext().resolveScope("screenshare/" + meetingID);
    } else {
      log.error("BigBlueButton Scope not initialized. No messages are going to the Flash client!");
    }

    return null;
  }

  private ISharedObject getSharedObject(IScope scope, String name) {
    ISharedObjectService service = (ISharedObjectService) ScopeUtils.getScopeService(scope, ISharedObjectService.class, SharedObjectService.class, false);
    return service.getSharedObject(scope, name);
  }
}
