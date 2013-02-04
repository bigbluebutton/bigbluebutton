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

package org.bigbluebutton.conference.service.chat;

import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.scope.IScope;
import org.red5.server.adapter.ApplicationAdapter;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;
import org.bigbluebutton.conference.service.recorder.chat.ChatEventRecorder;

public class ChatHandler extends ApplicationAdapter implements IApplication{
	private static Logger log = Red5LoggerFactory.getLogger( ChatHandler.class, "bigbluebutton" );

	private RecorderApplication recorderApplication;
	private ChatApplication chatApplication;

	
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
		ChatEventRecorder recorder = new ChatEventRecorder(connection.getScope().getName(), recorderApplication);
		chatApplication.addRoomListener(connection.getScope().getName(), recorder);

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
    	return true;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug("roomStop ", scope.getName());
		chatApplication.destroyRoom(scope.getName());
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
}