package org.bigbluebutton.webconference.voice.events;

public class ParticipantLeftEvent extends ConferenceEvent {

	public ParticipantLeftEvent(Integer participantId, String room) {
		super(participantId, room);
	}
}
