package org.bigbluebutton.webconference.voice.events;

public class ParticipantJoinedEvent extends ConferenceEvent {

	private final String callerIdNum;
	private final String callerIdName;
	private final Boolean muted;
	private final Boolean speaking;
	
	public ParticipantJoinedEvent(Integer participantId, String room, 
								String callerIdNum, String callerIdName,
								Boolean muted, Boolean speaking) {
		super(participantId, room);
		this.callerIdName = callerIdName;
		this.callerIdNum = callerIdNum;
		this.muted = muted;
		this.speaking = speaking;
	}

	public String getCallerIdNum() {
		return callerIdNum;
	}

	public String getCallerIdName() {
		return callerIdName;
	}

	public Boolean getMuted() {
		return muted;
	}

	public Boolean getSpeaking() {
		return speaking;
	}

}
