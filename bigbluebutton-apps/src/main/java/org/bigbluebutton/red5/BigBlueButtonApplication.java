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
package org.bigbluebutton.red5;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.pubsub.MessagePublisher;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.IApplication;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.Red5;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;

import com.google.gson.Gson;

public class BigBlueButtonApplication extends MultiThreadedApplicationAdapter {
	private static Logger log = Red5LoggerFactory.getLogger(BigBlueButtonApplication.class, "bigbluebutton");

	private ConnectionInvokerService connInvokerService;
	private MessagePublisher red5InGW;

	private final UserConnectionMapper userConnections = new UserConnectionMapper();

	private final String APP = "BBB";
	private final String CONN = "RED5-";
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		return super.appConnect(conn, params);
	}

	@Override
	public void appDisconnect(IConnection conn) {
		super.appDisconnect(conn);
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		return super.appJoin(client, scope);
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		super.appLeave(client, scope);
	}
	
	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		return super.roomJoin(client, scope);
	}
	
	@Override
	public void roomLeave(IClient client, IScope scope) {
		super.roomLeave(client, scope);
	}
	
	@Override
  public boolean appStart(IScope app) {
		super.appStart(app);        
		connInvokerService.setAppScope(app);

		getHeapStats();

		return true;
	}

	private void getHeapStats() {
		Runnable getHeapTask = () -> getHeapStatsHelper();

		ScheduledExecutorService executor = Executors.newScheduledThreadPool(1);
		executor.scheduleAtFixedRate(getHeapTask, 0, 5, TimeUnit.SECONDS);
	}

	private void getHeapStatsHelper() {
		int mb = 1024*1024;

		// Getting the runtime reference from system
		Runtime runtime = Runtime.getRuntime();

		long usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / mb;
		long freeMemory = runtime.freeMemory() / mb;
		long totalMemory = runtime.totalMemory() / mb;
		long maxMemory = runtime.maxMemory() / mb;

		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("used", usedMemory);
		logData.put("free", freeMemory);
		logData.put("total", totalMemory);
		logData.put("max", maxMemory);

		Gson gson = new Gson();
		String logStr =  gson.toJson(logData);
		log.info("JVM Heap [MB] data={}", logStr);
	}

	@Override
	public void appStop(IScope app) {
		super.appStop(app);
	}
    
	@Override
	public boolean roomStart(IScope room) {
		return super.roomStart(room);
	}	
	
	@Override
	public void roomStop(IScope room) {
		super.roomStop(room);
	}
    	
	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		String username = ((String) params[0]).toString();
		String role = ((String) params[1]).toString();
		String room = ((String)params[2]).toString();
               
		String voiceBridge = ((String) params[3]).toString();
		
		boolean record = (Boolean)params[4];
		
		String externalUserID = ((String) params[5]).toString();
		String internalUserID = ((String) params[6]).toString();
    	
		Boolean muted  = false;
		if (params.length >= 7 && ((Boolean) params[7])) {
			muted = true;
		}
    	
		Map<String, Boolean> lsMap = null;
		if (params.length >= 8) {
			try {
				lsMap = (Map<String, Boolean> ) params[8];
			} catch(Exception e){
				lsMap = new HashMap<String, Boolean>();
			}
		}
		   	    	
		String userId = internalUserID;
		String sessionId = Red5.getConnectionLocal().getSessionId();
		String connType = getConnectionType(Red5.getConnectionLocal().getType());

		/**
		 * Find if there are any other connections owned by this user. If we find one,
		 * that means that the connection is old and the user reconnected. Clear the
		 * userId attribute so that messages would not be sent in the defunct connection.
		 */
		Set<IConnection> conns = Red5.getConnectionLocal().getScope().getClientConnections();
		for (IConnection conn : conns) {
			String connUserId = (String) conn.getAttribute("INTERNAL_USER_ID");
			String connSessionId = conn.getSessionId();
			String clientId = conn.getClient().getId();
			String remoteHost = connection.getRemoteAddress();
			int remotePort = connection.getRemotePort();
			if (connUserId != null && connUserId.equals(userId) && !connSessionId.equals(sessionId)) {
				conn.removeAttribute("INTERNAL_USER_ID");
				Map<String, Object> logData = new HashMap<String, Object>();
				logData.put("meetingId", room);
				logData.put("userId", userId);
				logData.put("oldConnId", connSessionId);
				logData.put("newConnId", sessionId);
				logData.put("clientId", clientId);
				logData.put("remoteAddress", remoteHost + ":" + remotePort);
				logData.put("event", "removing_defunct_connection");
				logData.put("description", "Removing defunct connection BBB Apps.");

				Gson gson = new Gson();
				String logStr =  gson.toJson(logData);

				log.info("Removing defunct connection: data={}", logStr);
			}
		}


		BigBlueButtonSession bbbSession = new BigBlueButtonSession(room, internalUserID,  username, role, 
    			voiceBridge, record, externalUserID, muted, sessionId);
		connection.setAttribute(Constants.SESSION, bbbSession);        
		connection.setAttribute("INTERNAL_USER_ID", internalUserID);
		connection.setAttribute("USER_SESSION_ID", sessionId);
		connection.setAttribute("TIMESTAMP", System.currentTimeMillis());
        
		red5InGW.initLockSettings(room, lsMap);
		
		red5InGW.initAudioSettings(room, internalUserID, muted);

	    String meetingId = bbbSession.getRoom();

	    String userFullname = bbbSession.getUsername();
	    String connId = Red5.getConnectionLocal().getSessionId();	        
		
		String remoteHost = Red5.getConnectionLocal().getRemoteAddress();
		int remotePort = Red5.getConnectionLocal().getRemotePort();
		String clientId = Red5.getConnectionLocal().getClient().getId();

		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", meetingId);
		logData.put("connType", connType);
		logData.put("connId", connId);
		logData.put("clientId", clientId);
		logData.put("remoteAddress", remoteHost + ":" + remotePort);
		logData.put("userId", userId);
		logData.put("externalUserId", externalUserID);
		logData.put("sessionId", sessionId);
		logData.put("username", userFullname);
		logData.put("event", "user_joining_bbb_apps");
		logData.put("description", "User joining BBB Apps.");
		
		Gson gson = new Gson();
        String logStr =  gson.toJson(logData);
		
		log.info("User joining bbb-apps: data={}", logStr);

		userConnections.addUserConnection(userId, connId);

		return super.roomConnect(connection, params);
        
	}

	private String getConnectionType(String connType) {
		if ("persistent".equals(connType.toLowerCase())) {
			return "RTMP";
		} else if("polling".equals(connType.toLowerCase())) {
			return "RTMPT";
		} else {
			return connType.toUpperCase();
		}
	}
	
	@Override
	public void roomDisconnect(IConnection conn) {

		String remoteHost = Red5.getConnectionLocal().getRemoteAddress();
		int remotePort = Red5.getConnectionLocal().getRemotePort();

	    BigBlueButtonSession bbbSession = (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	          
	    String meetingId = bbbSession.getRoom();
	    String userId = bbbSession.getInternalUserID();
	    String connType = getConnectionType(Red5.getConnectionLocal().getType());
	    String userFullname = bbbSession.getUsername();
	    String connId = Red5.getConnectionLocal().getSessionId();
		String clientId = Red5.getConnectionLocal().getClient().getId();
        String sessionId =  CONN + userId;
	    	    
	    Map<String, Object> logData = new HashMap<String, Object>();
	    logData.put("meetingId", meetingId);
	    logData.put("connType", connType);
	    logData.put("connId", connId);
		logData.put("clientId", clientId);
		logData.put("remoteAddress", remoteHost + ":" + remotePort);
	    logData.put("sessionId", sessionId);
	    logData.put("userId", userId);
	    logData.put("username", userFullname);
	    logData.put("event", "user_leaving_bbb_apps");
	    logData.put("description", "User leaving BBB Apps.");
	    
	    Gson gson = new Gson();
	    String logStr =  gson.toJson(logData);

		boolean removeUser = userConnections.userDisconnected(userId, connId);
		if (removeUser) {
			log.info("User leaving bbb-apps: data={}", logStr);
			red5InGW.userLeft(bbbSession.getRoom(), getBbbSession().getInternalUserID(), sessionId);
		} else {
			log.info("User not leaving bbb-apps but just disconnected: data={}", logStr);
		}

		super.roomDisconnect(conn);
	}
	
	public void validateToken(Map<String, String> msg) {
	   String token = (String) msg.get("authToken");
	        
		BigBlueButtonSession bbbSession = (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
		assert bbbSession != null;
		String userId = bbbSession.getInternalUserID();
		String meetingId = Red5.getConnectionLocal().getScope().getName();
        String connId = Red5.getConnectionLocal().getSessionId();    
        String sessionId =  CONN + connId + "-" + userId;
        
        Map<String, Object> logData = new HashMap<String, Object>();
        logData.put("meetingId", meetingId);
        logData.put("connId", connId);
        logData.put("sessionId", sessionId);
        logData.put("userId", userId);
        logData.put("token", token);
        logData.put("event", "user_validate_token_bbb_apps");
        logData.put("description", "User validate token BBB Apps.");
        
        Gson gson = new Gson();
        String logStr =  gson.toJson(logData);
            
        log.info("User validate token bbb-apps: data={}", logStr);
        red5InGW.validateAuthToken(meetingId, userId, token, meetingId + "/" + userId, sessionId);
	}
		
	
	public void setApplicationListeners(Set<IApplication> listeners) {
		Iterator<IApplication> iter = listeners.iterator();
		while (iter.hasNext()) {
			super.addListener((IApplication) iter.next());
		}
	}
		
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}

	public void setConnInvokerService(ConnectionInvokerService connInvokerService) {
		this.connInvokerService = connInvokerService;
	}
	
	public void setRed5Publisher(MessagePublisher red5InGW) {
		this.red5InGW = red5InGW;
	}
	
}
