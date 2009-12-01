package org.bigbluebutton.webconference.voice.events;

public class ParticipantJoinedEvent extends ConferenceEvent {

	private final String callerIdNum;
	private final String callerIdName;
	
	public ParticipantJoinedEvent(Integer participantId, String room, String callerIdNum, String callerIdName) {
		super(participantId, room);
		this.callerIdName = callerIdName;
		this.callerIdNum = callerIdNum;
	}

	public String getCallerIdNum() {
		return callerIdNum;
	}

	public String getCallerIdName() {
		return callerIdName;
	}

}
