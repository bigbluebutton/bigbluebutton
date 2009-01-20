/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
*
* Copyright (c) 2008 by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 2.1 of the License, or (at your option) any later
* version.
*
* This program is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with this program; if not, write to the Free Software Foundation, Inc.,
* 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
* 
*/
package org.bigbluebutton.conference.voice.asterisk;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.asteriskjava.live.AbstractAsteriskServerListener;
import org.asteriskjava.live.AsteriskServer;
import org.asteriskjava.live.DefaultAsteriskServer;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeRoom;
import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.manager.AuthenticationFailedException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.TimeoutException;

import org.bigbluebutton.conference.voice.IRoom;
import org.bigbluebutton.conference.voice.IVoiceConferenceService;
import org.bigbluebutton.conference.voice.RoomManager;


public class AsteriskVoiceConferenceService extends AbstractAsteriskServerListener implements IVoiceConferenceService {
	
	protected static Logger logger = LoggerFactory.getLogger(AsteriskVoiceConferenceService.class);
	
	private ManagerConnection managerConnection;
	private AsteriskServer asteriskServer;
	private RoomManager roomManager;
	
	/**
	 * This sends pings to our Asterisk server so Asterisk won't close the connection if there
	 * is no traffic.
	 */
	private PingThread pingThread;

	public void start() {
		try {
			logger.info("Logging at " + managerConnection.getHostname() + ":" + 
					managerConnection.getPort());
			
			asteriskServer.addAsteriskServerListener(this);
			managerConnection.login();
			((DefaultAsteriskServer)asteriskServer).setManagerConnection(managerConnection);		
			((DefaultAsteriskServer)asteriskServer).initialize();
			
			pingThread = new PingThread(managerConnection);
			pingThread.setTimeout(40000);
			pingThread.start();
		} catch (IOException e) {
			logger.error("IOException while connecting to Asterisk server.");
		} catch (TimeoutException e) {
			logger.error("TimeoutException while connecting to Asterisk server.");
		} catch (AuthenticationFailedException e) {
			logger.error("AuthenticationFailedException while connecting to Asterisk server.");
		} catch (ManagerCommunicationException e) {
			logger.error("ManagerCommunicationException while connecting to Asterisk server.");
		}
	}

	public void stop() {
		try {
			pingThread.die();
			managerConnection.logoff();
		} catch (IllegalStateException e) {
			logger.error("Logging off when Asterisk Server is not connected.");
		}		
	}
	
	/**
	 * 
	 * @param id
	 * @return
	 */
	public IRoom getRoom(String id) {
		if (roomManager.hasRoom(id)) {
			return roomManager.getRoom(id);
		} else {
			IRoom room = null;
			try {
				MeetMeRoom r = asteriskServer.getMeetMeRoom(id);
				room = new MeetMeRoomAdapter(r);
				roomManager.addRoom(room);
				return room;
			} catch (ManagerCommunicationException e) {
				logger.error("ManagerCommunicationException while getting room.");
			}			
		}
		return null;
	}
	
    public void onNewMeetMeUser(MeetMeUser user)
    {

    }
	
	public void setManagerConnection(ManagerConnection connection) {
		this.managerConnection = connection;
	}

	public void setAsteriskServer(AsteriskServer asteriskServer) {
		this.asteriskServer = asteriskServer;
	}

	public void setRoomManager(RoomManager roomManager) {
		this.roomManager = roomManager;
	}
}
