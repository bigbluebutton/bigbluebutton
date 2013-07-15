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
* Author: Hugo Lazzari <hslazzari@gmail.com>
*/
package org.bigbluebutton.conference.service.sharedNotes;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.adapter.IApplication;
import org.red5.server.api.IClient;
import org.red5.server.api.IConnection;
import org.red5.server.api.scope.IScope;
import org.red5.server.api.so.ISharedObject;
import org.bigbluebutton.conference.BigBlueButtonSession;
import org.bigbluebutton.conference.Constants;
import org.slf4j.Logger;
import org.red5.server.api.Red5;

public class SharedNotesHandler extends ApplicationAdapter implements IApplication {
	private static Logger log = Red5LoggerFactory.getLogger( SharedNotesHandler.class, "bigbluebutton" );

	private static final String APP = "SHAREDNOTES";
	private static final String SHAREDNOTES_SO = "sharedNotesSO";

	private SharedNotesApplication sharedNotesApplication;

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
		ISharedObject so = getSharedObject(connection.getScope(), SHAREDNOTES_SO);
		log.debug("Setting up Listener");
		SharedNotesSender sender = new SharedNotesSender(so);
		String room = connection.getScope().getName();
		log.debug("Adding event listener to " + room);
		log.debug("Adding room listener");
		sharedNotesApplication.addRoomListener(room, sender);
		BigBlueButtonSession bbbSession = getBbbSession();
		String userid = bbbSession.getInternalUserID();
		sharedNotesApplication.addRoomClient(room, userid);
		log.debug("Done setting up listener");
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		String room = connection.getScope().getName();
		sharedNotesApplication.removeRoomClient(room, Red5.getConnectionLocal().getClient().getId());
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
		sharedNotesApplication.createRoom(scope.getName());
		if (!hasSharedObject(scope, SHAREDNOTES_SO)) {
		     if (createSharedObject(scope, SHAREDNOTES_SO, false)) {
		  	   return true;
		     }
		}
		log.error("Failed to start room " + scope.getName());
		return false;
	}

	@Override
	public void roomStop(IScope scope) {
	log.debug(APP + ":roomStop " + scope.getName());
		sharedNotesApplication.destroyRoom(scope.getName());
		if (!hasSharedObject(scope, SHAREDNOTES_SO)) {
			clearSharedObjects(scope, SHAREDNOTES_SO);
		}
	}

	public void setSharedNotesApplication(SharedNotesApplication a) {
		log.debug("Setting sharedNotes application");
		sharedNotesApplication = a;
		sharedNotesApplication.handler = this;
	}

	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}

}
