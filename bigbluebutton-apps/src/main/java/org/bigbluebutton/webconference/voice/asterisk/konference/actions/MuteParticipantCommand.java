package org.bigbluebutton.webconference.voice.asterisk.konference.actions;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.konference.KonferenceEventsTransformer;

public class MuteParticipantCommand extends KonferenceCommand {
	private static final String SPACE = " ";
	
	private final Integer participant;
	private final Boolean mute;
	
	public MuteParticipantCommand(String room, Integer participant, Boolean mute, Integer requesterId) {
		super(room, requesterId);
		this.participant = participant;
		this.mute = mute;
	}

	@Override
	public CommandAction getCommandAction() {
		String action = "unmute";		
		if (mute) action = "mute";
		
		return new CommandAction("konference" + SPACE + action + SPACE + room + SPACE + participant);
	}

	@Override
	public void handleResponse(ManagerResponse response, KonferenceEventsTransformer eventHandler) {
		/*
		 * No need to handle the response. If the command was successful, the AMI should be 
		 * generating events which is handled by another class.
		 */
	}


}
