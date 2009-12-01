package org.bigbluebutton.webconference.voice.commands;

public class ConferenceCommandResult {

	private final String room;
	private final Integer requesterId;
	private boolean success = false;
	private String message = "";
	
	public ConferenceCommandResult(String room, Integer requesterId) {
		this.room = room;
		this.requesterId = requesterId;
	}

	public boolean isSuccess() {
		return success;
	}

	public void setSuccess(boolean success) {
		this.success = success;
	}

	public String getRoom() {
		return room;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Integer getRequesterId() {
		return requesterId;
	}
}
