package org.bigbluebutton.webconference.voice.events;

public abstract class ConferenceEvent {
	private final Integer participantId;
	private final String room;
	
	public ConferenceEvent(Integer participantId, String room) {
		this.participantId = participantId;
		this.room = room;
	}

	public Integer getParticipantId() {
		return participantId;
	}

	public String getRoom() {
		return room;
	}
	
}
