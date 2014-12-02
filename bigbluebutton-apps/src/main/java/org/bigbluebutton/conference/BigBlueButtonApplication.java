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

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import org.red5.server.api.Red5;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.core.api.IBigBlueButtonInGW;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.IApplication;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IContext;
import org.red5.server.api.scope.IScope;
import org.slf4j.Logger;
import com.google.gson.Gson;

public class BigBlueButtonApplication extends MultiThreadedApplicationAdapter {
	private static Logger log = Red5LoggerFactory.getLogger(BigBlueButtonApplication.class, "bigbluebutton");

	private RecorderApplication recorderApplication;
	private ConnectionInvokerService connInvokerService;
	private IBigBlueButtonInGW bbbGW;
	
	private static final String APP = "BBB";
	
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
		return true;
	}
    
	@Override
	public void appStop(IScope app) {
		super.appStop(app);
	}
    
	@Override
	public boolean roomStart(IScope room) {
		connInvokerService.addScope(room.getName(), room);
		return super.roomStart(room);
	}	
	
	@Override
	public void roomStop(IScope room) {
		recorderApplication.destroyRecordSession(room.getName());
		connInvokerService.removeScope(room.getName());
		
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
    	
		Boolean locked = false;
		if (params.length >= 7 && ((Boolean) params[7])) {
			locked = true;
		}
    	
		Boolean muted  = false;
		if (params.length >= 8 && ((Boolean) params[8])) {
			muted = true;
		}
    	
		Map<String, Boolean> lsMap = null;
		if (params.length >= 9) {
			try {
				lsMap = (Map<String, Boolean> ) params[9];
			} catch(Exception e){
				lsMap = new HashMap<String, Boolean>();
			}
		}
    	   	    	
		if (record == true) {
			recorderApplication.createRecordSession(room);
		}
			
		BigBlueButtonSession bbbSession = new BigBlueButtonSession(room, internalUserID,  username, role, 
    			voiceBridge, record, externalUserID, muted);
		connection.setAttribute(Constants.SESSION, bbbSession);        
		connection.setAttribute("INTERNAL_USER_ID", internalUserID);
        
		String debugInfo = "internalUserID=" + internalUserID + ",username=" + username + ",role=" +  role + "," + 
        					",voiceConf=" + voiceBridge + ",room=" + room + ",externalUserid=" + externalUserID;
		log.debug("User [{}] connected to room [{}]", debugInfo, room); 

		bbbGW.initLockSettings(room, locked, lsMap);
		
		connInvokerService.addConnection(bbbSession.getInternalUserID(), connection);

		String meetingId = bbbSession.getRoom();
		String userId = bbbSession.getInternalUserID();
		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String userFullname = bbbSession.getUsername();
		String connId = Red5.getConnectionLocal().getSessionId();
		
		log.info("User connected: sessionId=[" + connId + "], encoding=[" + connType +
				"], meetingId= [" + meetingId
				+ "], userId=[" + userId + "] username=[" + userFullname +"]");


		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", meetingId);
		logData.put("connType", connType);
		logData.put("connId", connId);
		logData.put("userId", userId);
		logData.put("username", userFullname);
		logData.put("event", "user_joining_bbb_apps");
		logData.put("description", "User joining BBB Apps.");
		
		Gson gson = new Gson();
    String logStr =  gson.toJson(logData);
		
		log.info("User joining bbbb-aps: data={}", logStr);
		
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
		String clientId = Red5.getConnectionLocal().getClient().getId();
		log.info("***** " + APP + "[clientid=" + clientId + "] disconnnected from " + remoteHost + ":" + remotePort + ".");
    	
		connInvokerService.removeConnection(getBbbSession().getInternalUserID());
    	
		BigBlueButtonSession bbbSession = (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
		
		String meetingId = bbbSession.getRoom();
		String userId = bbbSession.getInternalUserID();
		String connType = getConnectionType(Red5.getConnectionLocal().getType());
		String userFullname = bbbSession.getUsername();
		String connId = Red5.getConnectionLocal().getSessionId();
		
		log.info("User disconnected: sessionId=[" + connId + "], encoding=[" + connType +
				"], meetingId= [" + meetingId + "], userId=[" + userId + "] username=[" + userFullname +"]");
	
		Map<String, Object> logData = new HashMap<String, Object>();
		logData.put("meetingId", meetingId);
		logData.put("connType", connType);
		logData.put("connId", connId);
		logData.put("userId", userId);
		logData.put("username", userFullname);
		logData.put("event", "user_leaving_bbb_apps");
		logData.put("description", "User leaving BBB Apps.");
		
		bbbGW.userLeft(bbbSession.getRoom(), getBbbSession().getInternalUserID());
		
		super.roomDisconnect(conn);
	}
	
	public void validateToken(String token) {
		BigBlueButtonSession bbbSession = (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
		assert bbbSession != null;
		String userId = bbbSession.getInternalUserID();
		String meetingId = Red5.getConnectionLocal().getScope().getName();
		bbbGW.validateAuthToken(meetingId, userId, token, meetingId + "/" + userId);
	}
	
	public void joinMeeting(String userId) {
		BigBlueButtonSession bbbSession = getBbbSession();
		if (bbbSession != null) {
			String userid = bbbSession.getInternalUserID();
			String username = bbbSession.getUsername();
			String role = bbbSession.getRole();
			String meetingId = bbbSession.getRoom();
			log.debug(APP + ":joinMeeting - [" + meetingId + "] [" + userid + ", " + username + ", " + role + "]");
			
			bbbGW.userJoin(meetingId, userid);
		}
		
	}
	
	public void setRecorderApplication(RecorderApplication a) {
		recorderApplication = a;
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
	
	public void setBigBlueButtonInGW(IBigBlueButtonInGW bbbGW) {
		this.bbbGW = bbbGW;
	}
}
