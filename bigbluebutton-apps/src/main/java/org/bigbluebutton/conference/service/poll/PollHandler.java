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

package org.bigbluebutton.conference.service.poll;

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
//import org.bigbluebutton.conference.service.recorder.poll.PollEventRecorder;

public class PollHandler extends ApplicationAdapter implements IApplication{

	private static Logger log = Red5LoggerFactory.getLogger( PollHandler.class, "bigbluebutton" );
	private static final String POLL = "POLL";
	private static final String POLL_SO = "pollSO";   
	private static final String APP = "POLL";

	private RecorderApplication recorderApplication;
	private PollApplication pollApplication;
	private IScope scope;

	
	@Override
	public boolean appConnect(IConnection conn, Object[] params) {
		log.debug(APP + "appConnect");
		return true;
	}

	@Override
	public void appDisconnect(IConnection conn) {
		log.debug(APP + "appDisconnect");
	}

	@Override
	public boolean appJoin(IClient client, IScope scope) {
		log.debug(APP + "appJoin: " + scope.getName());
		return true;
	}

	@Override
	public void appLeave(IClient client, IScope scope) {
		log.debug(APP + "appLeave: " + scope.getName());
	}

	@Override
	public boolean appStart(IScope scope) {
		this.scope = scope;
		log.debug(APP + "appStart: " + scope.getName());
		return true;
	}

	@Override
	public void appStop(IScope scope) {
		log.debug(APP + "appStop: " + scope.getName());
	}

	@Override
	public boolean roomConnect(IConnection connection, Object[] params) {
		log.debug("roomConnect");
		log.debug(APP + "Setting up recorder");
		log.debug(APP + "adding event recorder to " + connection.getScope().getName());
		log.debug(APP + "Adding room listener");
		log.debug(APP + "Done setting up recorder and listener");
		return true;
	}

	@Override
	public void roomDisconnect(IConnection connection) {
		log.debug(APP + "roomDisconnect");
	}

	@Override
	public boolean roomJoin(IClient client, IScope scope) {
		log.debug(APP + "roomJoin " + scope.getName(), scope.getParent().getName());
		return true;
	}

	@Override
	public void roomLeave(IClient client, IScope scope) {
		log.debug(APP + "roomLeave: " + scope.getName());
	}

	@Override
	public boolean roomStart(IScope scope) {
		log.debug(APP + " roomStart " + scope.getName());
		pollApplication.createRoom(scope.getName());
		log.debug(APP + " inside roomStart startin room");
    	return true;
	}

	@Override
	public void roomStop(IScope scope) {
		log.debug(APP +"roomStop ", scope.getName());
		pollApplication.destroyRoom(scope.getName());
    }
	
	
	public void setPollApplication(PollApplication a) {
		log.debug("Setting chat application");
		pollApplication = a;
		pollApplication.handler = this;
	}
	
	public void setRecorderApplication(RecorderApplication a) {
		log.debug(APP + " Setting poll archive application");
		recorderApplication = a;
	}
	

	private BigBlueButtonSession getBbbSession() {
		return (BigBlueButtonSession) Red5.getConnectionLocal().getAttribute(Constants.SESSION);
	}
	
}
