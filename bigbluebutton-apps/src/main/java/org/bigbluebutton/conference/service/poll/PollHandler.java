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
import org.slf4j.Logger;
import org.red5.logging.Red5LoggerFactory;
import org.red5.server.adapter.ApplicationAdapter;
import org.red5.server.api.scope.IScope;
import org.bigbluebutton.conference.service.recorder.RecorderApplication;

public class PollHandler extends ApplicationAdapter implements IApplication {

	private static Logger log = Red5LoggerFactory.getLogger( PollHandler.class, "bigbluebutton" );
	private static final String APP = "POLL";
	private PollApplication pollApplication;


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
	}
	

	
}
