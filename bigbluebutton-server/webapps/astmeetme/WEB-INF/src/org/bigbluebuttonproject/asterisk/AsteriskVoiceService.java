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
package org.bigbluebuttonproject.asterisk;
import java.io.IOException;
import java.util.Collection;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.asteriskjava.live.AsteriskServer;
import org.asteriskjava.live.AsteriskServerListener;
import org.asteriskjava.live.DefaultAsteriskServer;
import org.asteriskjava.live.ManagerCommunicationException;
import org.asteriskjava.live.MeetMeRoom;
import org.asteriskjava.live.MeetMeUser;
import org.asteriskjava.manager.AuthenticationFailedException;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.TimeoutException;

import org.bigbluebuttonproject.asterisk.meetme.MeetMeRoomAdapter;


/**
 * The Class AsteriskVoiceService.
 */
public class AsteriskVoiceService implements IVoiceService {
	
	/** The logger. */
	protected static Logger logger = LoggerFactory.getLogger(AsteriskVoiceService.class);
	
	/** The manager connection. */
	private ManagerConnection managerConnection;
	
	/** The asterisk server. */
	private AsteriskServer asteriskServer = new DefaultAsteriskServer();
	
	/**
	 * Sets the manager connection.
	 * 
	 * @param connection the new manager connection
	 */
	public void setManagerConnection(ManagerConnection connection) {
		this.managerConnection = connection;
	}
	
	/**
	 * @see org.bigbluebuttonproject.asterisk.IVoiceService#start()
	 */
	public void start() {
		try {
			logger.info("Logging at " + managerConnection.getHostname() + ":" + 
					managerConnection.getPort());
			
			managerConnection.login();
			((DefaultAsteriskServer)asteriskServer).setManagerConnection(managerConnection);		
			((DefaultAsteriskServer)asteriskServer).initialize();
			
		} catch (IOException e) {
			logger.error("IOException while connecting to Asterisk server.");
		} catch (TimeoutException e) {
			logger.error("TimeoutException while connecting to Asterisk server.");
		} catch (AuthenticationFailedException e) {
			logger.error("AuthenticationFailedException while connecting to Asterisk server.");
		} catch (ManagerCommunicationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	/**
	 * @see org.bigbluebuttonproject.asterisk.IVoiceService#stop()
	 */
	public void stop() {
		try {
			managerConnection.logoff();
		} catch (IllegalStateException e) {
			logger.error("Logging off when Asterisk Server is not connected.");
		}		
	}
	
	/**
	 * @see org.bigbluebuttonproject.asterisk.IVoiceService#getConference(java.lang.String)
	 */
	public IConference getConference(String id) {
		IConference bridge = null;

		try {
			MeetMeRoom room = asteriskServer.getMeetMeRoom(id);
			bridge = new MeetMeRoomAdapter(room);
			bridge.getParticipants();
		} catch (ManagerCommunicationException e) {
			// TODO Auto-generated catch block
				e.printStackTrace();
		}
		
		return bridge;
	}
	
	/**
	 * @see org.bigbluebuttonproject.asterisk.IVoiceService#getUsers(java.lang.String)
	 */
	public Collection<MeetMeUser> getUsers(String roomId) {
		MeetMeRoom room;
		try {
			room = asteriskServer.getMeetMeRoom(roomId);
			return room.getUsers();
		} catch (ManagerCommunicationException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	/**
	 * @see org.bigbluebuttonproject.asterisk.IVoiceService#addAsteriskServerListener(org.asteriskjava.live.AsteriskServerListener)
	 */
	public void addAsteriskServerListener(AsteriskServerListener listener) throws ManagerCommunicationException {
		asteriskServer.addAsteriskServerListener(listener);
	}

}
