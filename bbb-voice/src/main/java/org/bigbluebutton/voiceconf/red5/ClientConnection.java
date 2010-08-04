/*
 * BigBlueButton - http://www.bigbluebutton.org
 * 
 * Copyright (c) 2008-2009 by respective authors (see below). All rights reserved.
 * 
 * BigBlueButton is free software; you can redistribute it and/or modify it under the 
 * terms of the GNU Lesser General Public License as published by the Free Software 
 * Foundation; either version 3 of the License, or (at your option) any later 
 * version. 
 * 
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY 
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A 
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License along 
 * with BigBlueButton; if not, If not, see <http://www.gnu.org/licenses/>.
 *
 * $Id: $
 */
package org.bigbluebutton.voiceconf.red5;

import org.red5.logging.Red5LoggerFactory;
import org.red5.server.api.service.IServiceCapableConnection;
import org.slf4j.Logger;

public class ClientConnection {
private static Logger log = Red5LoggerFactory.getLogger(ClientConnection.class, "sip");
	
	private final IServiceCapableConnection connection;
	private final String connId;
	
	public ClientConnection(String connId, IServiceCapableConnection connection) {
		this.connection = connection;
		this.connId = connId;
	}
	
	public String getConnId() {
		return connId;
	}
	
    public void onJoinConferenceSuccess(String publishName, String playName, String codec) {
    	log.debug( "SIP Call Connected" );
        connection.invoke("successfullyJoinedVoiceConferenceCallback", new Object[] {publishName, playName, codec});
    }

    public void onJoinConferenceFail() {
        log.debug("onOutgoingCallFailed");
        connection.invoke("failedToJoinVoiceConferenceCallback", new Object[] {"onUaCallFailed"});
    }

    public void onLeaveConference() {
    	log.debug("onCallClosed");
        connection.invoke("disconnectedFromJoinVoiceConferenceCallback", new Object[] {"onUaCallClosed"});
    }
}
