package org.bigbluebutton.webconference.voice.asterisk.konference.actions;

import org.asteriskjava.manager.action.CommandAction;
import org.asteriskjava.manager.response.ManagerResponse;
import org.bigbluebutton.webconference.voice.asterisk.konference.KonferenceEventHandler;

public abstract class KonferenceCommand {

	protected final String room;
	protected final Integer requesterId;
	
	public KonferenceCommand(String room, Integer requesterId) {
		this.room = room;
		this.requesterId = requesterId;
	}
		
	public abstract CommandAction getCommandAction();
	public abstract void handleResponse(ManagerResponse response, KonferenceEventHandler eventHandler);
	
	public String getRoom() {
		return room;
	}

	public Integer getRequesterId() {
		return requesterId;
	}
}
