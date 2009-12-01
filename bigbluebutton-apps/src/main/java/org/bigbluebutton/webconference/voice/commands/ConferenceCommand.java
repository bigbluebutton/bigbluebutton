package org.bigbluebutton.webconference.voice.commands;

public abstract class ConferenceCommand {

	private final String room;
	private final Integer requesterId;
	
	public ConferenceCommand(String room, Integer requesterId) {
		this.room = room;
		this.requesterId = requesterId;
	}

	public String getRoom() {
		return room;
	}

	public Integer getRequesterId() {
		return requesterId;
	}
	
	
}
