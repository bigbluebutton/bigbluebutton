package org.bigbluebutton.webconference.voice.commands;

public class EjectParticipantCommand extends ConferenceCommand {

	private final Integer participantId;
	
	public EjectParticipantCommand(String room, Integer requesterId, Integer participantId) {
		super(room, requesterId);
		this.participantId = participantId;
	}

	public Integer getParticipantId() {
		return participantId;
	}

}
