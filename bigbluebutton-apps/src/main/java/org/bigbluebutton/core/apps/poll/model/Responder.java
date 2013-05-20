package org.bigbluebutton.core.apps.poll.model;

public class Responder {
	private final String userID;
	
	public Responder(String userID) {
		this.userID = userID;
	}
	
	public String getUserID() {
		return userID;
	}
}
