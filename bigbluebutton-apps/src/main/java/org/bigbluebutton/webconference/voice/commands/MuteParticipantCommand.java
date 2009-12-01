package org.bigbluebutton.webconference.voice.commands;

public class MuteParticipantCommand extends ConferenceCommand {

	private final Integer participantId;
	private final boolean mute;
	
	public MuteParticipantCommand(String room, Integer requesterId, Integer participantId, boolean mute) {
		super(room, requesterId);
		this.participantId = participantId;
		this.mute = mute;
	}

	public Integer getParticipantId() {
		return participantId;
	}

	public boolean isMute() {
		return mute;
	}

}
