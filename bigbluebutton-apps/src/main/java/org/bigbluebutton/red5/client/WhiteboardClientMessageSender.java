package org.bigbluebutton.red5.client;

import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;


import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class WhiteboardClientMessageSender {
	private ConnectionInvokerService service;
	
	public WhiteboardClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handleWhiteboardMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				System.out.println("MEEESAGE:"+message);
//				switch (messageName) {
//				  case UndoWhiteboardMessageReply.VALIDATE_AUTH_TOKEN_REPLY:
//					  ValidateAuthTokenReplyMessage m = ValidateAuthTokenReplyMessage.fromJson(message);
//					  if (m != null) {
//						  processValidateAuthTokenReply(m);
//					  }
//					  break;
//				}
			}
		}		
	}
}
