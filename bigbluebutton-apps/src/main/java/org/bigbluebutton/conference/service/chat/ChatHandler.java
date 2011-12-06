/**
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
*/

package org.bigbluebutton.conference.service.chat;

import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.so.ISharedObject;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.Red5;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.chat.ChatEventRecorder;

public class ChatHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( ChatHandler.class, "bigbluebutton" );

	private static final String CHAT = "CHAT";
	private static final String CHAT_SO = "chatSO";   
	private static final String APP = "CHAT";

	private RecorderApplication recorderApplication;
	private ChatApplication chatApplication;
	private IScope scope;
	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug("appConnect");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug("appDisconnect");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug("appJoin: " + scope.getName());
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug("appLeave: " + scope.getName());
	}

	@Override
	public boolean appStart(IScope scope) {
		this.scope = scope;
		log.debug("appStart: " + scope.getName());
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug("appStop: " + scope.getName());
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("roomConnect");
		ISharedObject so = getSharedObject(connection.getScope(), CHAT_SO);
		log.debug("Setting up recorder");
		ChatMessageSender messageSender = new ChatMessageSender(so);
		ChatEventRecorder recorder = new ChatEventRecorder(connection.getScope().getName(), recorderApplication);
		log.debug("adding event recorder to " + connection.getScope().getName());
		log.debug("Adding room listener");
		chatApplication.addRoomListener(connection.getScope().getName(), recorder);
		chatApplication.addRoomListener(connection.getScope().getName(), messageSender);
		log.debug("Done setting up recorder and listener");
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug("roomDisconnect");
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug("roomJoin " + scope.getName(), scope.getParent().getName());
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug("roomLeave: " + scope.getName());
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug("roomStart " + scope.getName());
		chatApplication.createRoom(scope.getName());
    	if (!hasSharedObject(scope, CHAT_SO)) {
    		if (createSharedObject(scope, CHAT_SO, false)) {    			
    			return true; 			
    		}    		
    	}  	
		log.error("Failed to start room " + scope.getName());
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("roomStop ", scope.getName());
		chatApplication.destroyRoom(scope.getName());
		if (!hasSharedObject(scope, CHAT_SO)) {
    		clearSharedObjects(scope, CHAT_SO);
    	}
	}
	
	public void setChatApplication(ChatApplication a) {
		log.debug("Setting chat application");
		chatApplication = a;
		chatApplication.handler = this;
	}
	
	public void setRecorderApplication(RecorderApplication a) {
		log.debug("Setting archive application");
		recorderApplication = a;
	}
	
	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
}