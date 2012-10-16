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
    public String fromTime;    
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
		msg.put("chatType", chatType);
		msg.put("message", message);
		msg.put("toUserID", toUserID);
		msg.put("toUsername", toUsername);
		
		return msg;
	}
}
