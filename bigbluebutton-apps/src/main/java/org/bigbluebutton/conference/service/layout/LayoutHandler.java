/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 *
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
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
 * Author: Felipe Cecagno <felipe@mconf.org>
 */
package org.bigbluebutton.conference.service.layout;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.IScope;
import org.red5.server.api.so.ISharedObject;
import org.slf4j.Logger;

public class LayoutHandler extends ApplicationAdapter implements IApplication {
	private static Logger log = Red5LoggerFactory.getLogger( LayoutHandler.class, "bigbluebutton" );

	private static final String APP = "LAYOUT";
	private static final String LAYOUT_SO = "layoutSO";   

	private LayoutApplication layoutApplication;

	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug(APP + ":appConnect");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug( APP + ":appDisconnect");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug( APP + ":appJoin " + scope.getName());
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug(APP + ":appLeave " + scope.getName());
	}

	@Override
	public boolean appStart(IScope scope) {
		log.debug(APP + ":appStart " + scope.getName());
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug(APP + ":appStop " + scope.getName());
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug(APP + ":roomConnect");
		ISharedObject so = getSharedObject(connection.getScope(), LAYOUT_SO);
		log.debug("Setting up Listener");
		LayoutSender sender = new LayoutSender(so);
		String room = connection.getScope().getName();
		log.debug("Adding event listener to " + room);
		log.debug("Adding room listener");
		layoutApplication.addRoomListener(room, sender);
		log.debug("Done setting up listener");
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug(APP + ":roomDisconnect");
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug(APP + ":roomJoin " + scope.getName() + " - " + scope.getParent().getName());
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug(APP + ":roomLeave " + scope.getName());
	}
	
	@Override
	public boolean roomStart(IScope scope) {
		log.debug(APP + ":roomStart " + scope.getName());
		layoutApplication.createRoom(scope.getName());
    	if (!hasSharedObject(scope, LAYOUT_SO)) {
    		if (createSharedObject(scope, LAYOUT_SO, false)) {   
    			return true;
    		}    		
    	}  	
		log.error("Failed to start room " + scope.getName());
    	return false;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug(APP + ":roomStop " + scope.getName());
		layoutApplication.destroyRoom(scope.getName());
		if (!hasSharedObject(scope, LAYOUT_SO)) {
    		clearSharedObjects(scope, LAYOUT_SO);
    	}
	}
	
	public void setLayoutApplication(LayoutApplication a) {
		log.debug("Setting layout application");
		layoutApplication = a;
		layoutApplication.handler = this;
	}
	
}
