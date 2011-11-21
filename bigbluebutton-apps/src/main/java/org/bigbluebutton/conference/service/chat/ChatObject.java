package org.bigbluebutton.conference.service.chat;

public class ChatObject {
	public String message;
	public String username;
	public String color;
	public String time;
	public String language; 
	public String userid;
	
	public ChatObject(){
		
	}
	
	public ChatObject(String message, String username, String color,
			String time, String language, String userid) {
		this.message = message;
		this.username = username;
		this.color = color;
		this.time = time;
		this.language = language;
		this.userid = userid;
	}
	
}
