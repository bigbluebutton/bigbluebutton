package org.bigbluebutton.webconference.voice.asterisk.meetme;

import org.bigbluebutton.webconference.voice.ConferenceApplication;

public class MeetMeApplicationFacade implements ConferenceApplication {

	private MeetMeApplication meetme;
	
	@Override
	public void eject(String room, Integer participant) {
		meetme.kick(participant, room);
	}

	@Override
	public void mute(String room, Integer participant, Boolean mute) {
		meetme.mute(participant, room, mute);
	}

	@Override
	public void populateRoom(String room) {
		meetme.initializeRoom(room);
	}

	@Override
	public void shutdown() {
		meetme.shutdown();
	}

	@Override
	public void startup() {
		meetme.startup();
	}

	public void setMeetMeApplication(MeetMeApplication meetme) {
		this.meetme = meetme;
	}
}
