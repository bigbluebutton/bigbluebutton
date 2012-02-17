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
package org.bigbluebutton.webconference.voice.freeswitch;

import java.net.ConnectException;

import org.freeswitch.esl.client.inbound.Client;
import org.freeswitch.esl.client.inbound.InboundConnectionFailure;
import org.freeswitch.esl.client.manager.ManagerConnection;
import org.bigbluebutton.webconference.voice.ConferenceServiceProvider;
import org.bigbluebutton.webconference.voice.events.ConferenceEventListener;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class FreeswitchServiceProvider implements ConferenceServiceProvider {
	private static Logger log = Red5LoggerFactory.getLogger(FreeswitchServiceProvider.class, "bigbluebutton");
	
	private ConferenceServiceProvider appDelegate;
	private ManagerConnection connection;
	private ConferenceEventListener conferenceEventListener;
	
	@Override
    public void record(String room, String meetingid){
    	appDelegate.record(room,meetingid);
    }
	
	@Override
	public void eject(String room, Integer participant) {
		appDelegate.eject(room, participant);
	}

	@Override
	public void mute(String room, Integer participant, Boolean mute) {
		appDelegate.mute(room, participant, mute);
	}

	@Override
	public void populateRoom(String room) {
		appDelegate.populateRoom(room);
	}

	@Override
	public void shutdown() {
		if ((connection != null) ) {
			Client c = connection.getESLClient();
			if((c != null ) && c.canSend()) {
				log.info("Logging off fom [" + connection.toString() + "]");
				connection.disconnect();
            }
		}
		appDelegate.shutdown();
	}

	@Override
	public boolean startup() {
		if (connection == null) {
			log.error("Cannot start application as ESL Client has not been set.");
			return false;
		}

		if (connect()) {
            return appDelegate.startup();
		} else {
			return false;
		}
	}
	
	private boolean connect() {
		log.info("Logging in as [" + connection.getPassword() + "] to [" + connection.getHostname() + ":" + connection.getPort() + "]");
		try {
			connection.connect();
			return true;
        } catch ( InboundConnectionFailure e ) {
			log.error( "Connect to FreeSwitch ESL socket failed", e );
		} 
		return false;
	}
	
	public void setManagerConnection(ManagerConnection c) {
		connection = c;
	}

	public void setFreeswitchApplication(FreeswitchApplication f) {
		appDelegate = f;
		
    }

	@Override
	public void setConferenceEventListener(ConferenceEventListener l) {
		conferenceEventListener = l;		
		appDelegate.setConferenceEventListener(conferenceEventListener);
	}
}
