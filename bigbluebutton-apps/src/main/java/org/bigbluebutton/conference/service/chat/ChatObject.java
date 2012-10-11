package org.bigbluebutton.conference.service.chat;

import java.util.HashMap;
import java.util.Map;

/*
 * This class has been setted his attributes to public, for serialize with the model of the bigbluebutton-client, in order
 *  to enable the communication. This class is used for send public and private.
 * 
 * */

public class ChatObject {
	public String message;
	public String username;
	public String color;
	public String time;
	public String language; 
	public String userid;
	public String type;
		
	public ChatObject(String message, String username, String color, String time, String language, String userid, String type) {
		this.message = message;
		this.username = username;
		this.color = color;
		this.time = time;
		this.language = language;
		this.userid = userid;
		this.type = type;
	}
	
	public Map<String, Object> toMap() {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("userID", userid);
		msg.put("username", username);
		msg.put("message", message);
		msg.put("color", color);
		msg.put("lang", language);
		msg.put("time", time);
		msg.put("type", type);
		
		return msg;
	}
}
