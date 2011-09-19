/** 
* ===License Header===
*
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2010 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
* 
* ===License Header===
*/
package org.bigbluebutton.conference.service.rtmpadapter;

import java.util.ArrayList;
import java.util.List;

import org.red5.compatibility.flex.messaging.io.ArrayCollection;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.IApplication;
import org.red5.server.adapter.MultiThreadedApplicationAdapter;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.Red5;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;
import redis.clients.jedis.Jedis;

public class RTMPAdapterApp extends MultiThreadedApplicationAdapter implements IApplication {
	
	private static Logger log = Red5LoggerFactory.getLogger(RTMPAdapterApp.class, "bigbluebutton");
	private static final String APP = "RTMPAdapter";

	private ChannelManager channelManager;

	@Override
	public boolean appStart(IScope app){
		log.info("Starting RTMPAdapterApp");
		this.scope = app;
		
		channelManager = new ChannelManager(this);
                channelManager.subscribe();
		return true;
	}

	@Override
	public void appStop(IScope scope){
	}
	
	public void sendData(String appName, String method, String data){
		IScope clientScope = getLocalScope();
		String clientScopeId = clientScope.getName();
		ISharedObject sharedObject = getSharedObject(clientScope, appName);
		if (!channelManager.hasSharedObject(clientScopeId, appName) && (sharedObject != null)) channelManager.registerSharedObject(clientScopeId, appName, sharedObject);

		channelManager.sendData(appName, clientScopeId, method, data);
	}

	public void message(String channel, String message){
		log.info("got message from redis on channel: " + channel + " - " + message);
	}

	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {

	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
    	return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {

	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
	}

	@Override
	public boolean roomStart(IScope scope) {
		channelManager.registerRoom(scope.getName());
		log.info("RTMPAdapter room started:  " + scope.getName());
    		return true;
	}

	@Override
	public void roomStop(IScope scope) {
		channelManager.removeRoom(scope.getName());
		log.info("RTMPAdapter room ended:  " + scope.getName());
	}
	
	private IScope getLocalScope(){
		return Red5.getConnectionLocal().getScope();
	}
	
}
