package org.bigbluebutton.conference.service.chat;

public class ChatObject {
	private String message;
	private String username;
	private String color;
	private String time;
	private String language; 
	private String userid;
	
	public ChatObject(String message, String username, String color,
			String time, String language, String userid) {
		this.message = message;
		this.username = username;
		this.color = color;
		this.time = time;
		this.language = language;
		this.userid = userid;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getTime() {
		return time;
	}

	public void setTime(String time) {
		this.time = time;
	}

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getUserid() {
		return userid;
	}

	public void setUserid(String userid) {
		this.userid = userid;
	}
	
	
}
