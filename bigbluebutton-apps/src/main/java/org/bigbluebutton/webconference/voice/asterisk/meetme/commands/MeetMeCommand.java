package org.bigbluebutton.webconference.voice.asterisk.meetme.commands;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.meetme.MeetMeEventHandler;

public abstract class MeetMeCommand {

	protected final String room;
	protected final Integer requesterId;
	
	public MeetMeCommand(String room, Integer requesterId) {
		this.room = room;
		this.requesterId = requesterId;
	}
		
	public abstract CommandAction getCommandAction();
	public abstract void handleResponse(ManagerResponse response, MeetMeEventHandler eventHandler);
	
	public String getRoom() {
		return room;
	}

	public Integer getRequesterId() {
		return requesterId;
	}
}
