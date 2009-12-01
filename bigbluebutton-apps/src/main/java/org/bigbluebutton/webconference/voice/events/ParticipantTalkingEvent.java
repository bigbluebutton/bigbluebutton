package org.bigbluebutton.webconference.voice.events;

public class ParticipantTalkingEvent extends ConferenceEvent {

	private final boolean talking;
	
	public ParticipantTalkingEvent(Integer participantId, String room, boolean talking) {
		super(participantId, room);
		this.talking = talking;
	}

	public boolean isTalking() {
		return talking;
	}

}
