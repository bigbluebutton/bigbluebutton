package org.bigbluebutton.webconference.voice.asterisk.konference;

import org.bigbluebutton.webconference.voice.ConferenceApplication;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.EjectParticipantCommand;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.MuteParticipantCommand;
import org.bigbluebutton.webconference.voice.asterisk.konference.actions.PopulateRoomCommand;

public class KonferenceApplication implements ConferenceApplication {

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
		konfMgr.startup();
	}
	
	public void setKonferenceManager(KonferenceManager km) {
		konfMgr = km;
	}
}
