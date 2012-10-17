package org.bigbluebutton.conference.service.chat;

import java.util.HashMap;
import java.util.Map;

public class ChatMessageVO {
    // The type of chat (PUBLIC or PRIVATE)
    public String chatType;
    
    // The sender
    public String fromUserID;    
    public String fromUsername;
    public String fromColor;
    
    // Stores the UTC time (milliseconds) when the message was sent.
    public Double fromTime;   
    // Stores the timezone offset (minutes) when the message was sent.
    // This will be used by receiver to convert to locale time.
    public Long fromTimezoneOffset;
    
    public String fromLang; 
    
    // The receiver. For PUBLIC chat this is empty
    public String toUserID = "";
    public String toUsername = "";
    
	public String message;

			
	public Map<String, Object> toMap() {
		Map<String, Object> msg = new HashMap<String, Object>();
		msg.put("fromUserID", fromUserID);
		msg.put("fromUsername", fromUsername);
		msg.put("fromColor", fromColor);
		msg.put("fromTime", fromTime);
		msg.put("fromLang", fromLang);
		msg.put("fromTime", fromTime);
		msg.put("fromTimezoneOffset", fromTimezoneOffset);
		msg.put("chatType", chatType);
		msg.put("message", message);
		msg.put("toUserID", toUserID);
		msg.put("toUsername", toUsername);
		
		return msg;
	}
}
