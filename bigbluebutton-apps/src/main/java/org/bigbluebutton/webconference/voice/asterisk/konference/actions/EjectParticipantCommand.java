package org.bigbluebutton.webconference.voice.asterisk.konference.actions;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.konference.KonferenceEventsTransformer;

public class EjectParticipantCommand extends KonferenceCommand {
	private static final String SPACE = " ";
	
	private final Integer participant;
	
	public EjectParticipantCommand(String room, Integer participant, Integer requesterId) {
		super(room, requesterId);
		this.participant = participant;
	}

	@Override
	public CommandAction getCommandAction() {
		return new CommandAction("konference kick" + SPACE + room + SPACE + participant);
	}

	@Override
	public void handleResponse(ManagerResponse response, KonferenceEventsTransformer eventHandler) {
		/*
		 * No need to handle the response. If the command was successful, the AMI should be 
		 * generating events which is handled by another class.
		 */
	}


}
