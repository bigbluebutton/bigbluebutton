package org.bigbluebutton.webconference.voice.events;

public class ParticipantMutedEvent extends ConferenceEvent {

	private final boolean muted;
	
	public ParticipantMutedEvent(Integer participantId, String room, boolean muted) {
		super(participantId, room);
		this.muted = muted;
	}

	public boolean isMuted() {
		return muted;
	}

}
