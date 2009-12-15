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
 * Author: Richard Alam <ritzalam@gmail.com>
 * 
 * $Id: $
 */
package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.bigbluebutton.webconference.voice.ConferenceServiceProvider;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.EjectParticipantCommand;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.MuteParticipantCommand;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.PopulateRoomCommand;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

public class KonferenceApplication implements ConferenceServiceProvider {
	private static Logger log = Red5LoggerFactory.getLogger(KonferenceApplication.class, "bigbluebutton");
	
	private KonferenceManager konfMgr;

	private final Integer USER = 0; /* not used for now */
	
	@Override
	public void eject(String room, Integer participant) {
		EjectParticipantCommand epc = new EjectParticipantCommand(room, participant, USER);
		konfMgr.sendCommand(epc);
	}

	@Override
	public void mute(String room, Integer participant, Boolean mute) {
		MuteParticipantCommand mpc = new MuteParticipantCommand(room, participant, mute, USER);
		konfMgr.sendCommand(mpc);
	}

	@Override
	public void populateRoom(String room) {
		PopulateRoomCommand prc = new PopulateRoomCommand(room, USER);
		konfMgr.sendCommand(prc);
	}

	@Override
	public void shutdown() {
		konfMgr.shutdown();
	}

	@Override
	public void startup() {
		log.debug("Starting KonferenceApplication");
		konfMgr.startup();
	}
	
	public void setKonferenceManager(KonferenceManager km) {
		konfMgr = km;
	}
}
