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
package org.bigbluebutton.app.video;

import com.google.gson.Gson;
import org.bigbluebutton.red5.pubsub.message.ClientMessage;
import org.bigbluebutton.red5.pubsub.message.ValidateConnTokenRespMsg;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.IConnection;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;
import org.slf4j.Marker;
import org.slf4j.MarkerFactory;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

public class ConnectionInvokerService {
  private static Logger log = Red5LoggerFactory.getLogger(ConnectionInvokerService.class, "video");

  private final String CONN = "RED5-";
  private static final int NTHREADS = 1;
  private static final Executor exec = Executors.newFixedThreadPool(NTHREADS);
  private static final ExecutorService runExec = Executors.newFixedThreadPool(3);

  private BlockingQueue<ClientMessage> messages;
  private volatile boolean sendMessages = false;
  private IScope bbbAppScope;

  private final long SEND_TIMEOUT = 5000000000L; // 5s

  private Long lastMsgLengthLog = System.currentTimeMillis();

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
            if (System.currentTimeMillis() - lastMsgLengthLog > 60000) {
              lastMsgLengthLog = System.currentTimeMillis();
              log.info("Message queue length = " + messages.size());
            }
            message = messages.take();
            if (log.isTraceEnabled()) {
              log.trace("Took message from queue: " + message.getMessageName());
            }
            sendMessageToClient(message);
            if (log.isTraceEnabled()) {
              log.trace("Sent message to client: " + message.getMessageName());
            }
          } catch (Exception e) {
            Marker sendingException = MarkerFactory.getMarker("SENDING_EXCEPTION");
            log.error(sendingException, "Exception while sending message to client.", e);
          }
        }
      }
    };
    exec.execute(sender);
  }

  public void stop() {
    sendMessages = false;
    runExec.shutdown();
  }

  public void sendMessage(final ClientMessage message) {
    if (log.isTraceEnabled()) {
      log.trace("Queue message: " + message.getMessageName());
    }
    messages.offer(message);
  }

  private void sendMessageToClient(ClientMessage message) {
    if (message instanceof ValidateConnTokenRespMsg) {
      handleValidateConnTokenRespMsg((ValidateConnTokenRespMsg) message);
    }
  }

  private void handleValidateConnTokenRespMsg(ValidateConnTokenRespMsg msg) {
    if (log.isTraceEnabled()) {
      log.trace("Handle direct message: " + msg.getMessageName() + " conn=" + msg.connId);
    }

    IScope meetingScope = getScope(msg.meetingId);
    if (meetingScope != null) {
      String userId = msg.userId;
      IConnection conn = getConnection(meetingScope, userId);
      if (conn != null) {
        if (conn.isConnected() && !msg.authzed) {
          Map<String, Object> logData = new HashMap<String, Object>();
          logData.put("meetingId", msg.meetingId);
          logData.put("userId", userId);
          logData.put("authzed", msg.authzed);
          logData.put("app", "video");
          logData.put("event", "close_unauthorized_connection");
          logData.put("description", "Closing unauthorized connection.");

          Gson gson = new Gson();
          String logStr = gson.toJson(logData);

          log.info("Closing unauthorized connection: data={}", logStr);
          conn.close();
        }
      }
    }
  }

  private IConnection getConnectionWithConnId(IScope scope, String connId) {
    for (IConnection conn : scope.getClientConnections()) {
      String connID = (String) conn.getSessionId();
      if (connID != null && connID.equals(connId)) {
        return conn;
      }
    }

    log.warn("Failed to get connection for connId = " + connId);
    return null;
  }

  private IConnection getConnection(IScope scope, String userId) {
    for (IConnection conn : scope.getClientConnections()) {
      String connID = (String) conn.getAttribute("USERID");
      if (connID != null && connID.equals(userId)) {
        return conn;
      }
    }

    log.warn("Failed to get connection for userId = " + userId);
    return null;
  }

  public IScope getScope(String meetingID) {
    if (bbbAppScope != null) {
      return bbbAppScope.getContext().resolveScope("video");
    } else {
      log.error("BigBlueButton Scope not initialized. No messages are going to the Flash client!");
    }
    
    return null;
  }
}
