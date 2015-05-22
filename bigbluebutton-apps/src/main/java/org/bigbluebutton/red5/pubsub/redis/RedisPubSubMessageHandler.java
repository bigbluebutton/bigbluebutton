package org.bigbluebutton.red5.pubsub.redis;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;
import org.bigbluebutton.red5.pubsub.messages.MessagingConstants;
import org.bigbluebutton.red5.pubsub.messages.UserLeftMessage;
import org.bigbluebutton.red5.pubsub.messages.ValidateAuthTokenReplyMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class RedisPubSubMessageHandler implements MessageHandler {

	private ConnectionInvokerService service;
	
	public void setConnectionInvokerService(ConnectionInvokerService s) {
		this.service = s;
	}
	
	@Override
	public void handleMessage(String pattern, String channel, String message) {
		if (channel.equalsIgnoreCase(MessagingConstants.FROM_CHAT_CHANNEL)) {
			handleChatMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_PRESENTATION_CHANNEL)) {
			handlePresentationMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {
			handleMeetingMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {
			System.out.println("RedisPubSubMessageHandler message: " + pattern + " " + channel + " " + message);

			handleUsersMessage(message);
		} else if (channel.equalsIgnoreCase(MessagingConstants.FROM_WHITEBOARD_CHANNEL)) {
			handleWhiteboarMessage(message);
		} 
	}
	
	private void handleChatMessage(String message) {
		
	}

	private void handlePresentationMessage(String message) {
		
	}
	
	private void handleMeetingMessage(String message) {
		
	}
	
	private void handleUsersMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
				  case ValidateAuthTokenReplyMessage.VALIDATE_AUTH_TOKEN_REPLY:
					  ValidateAuthTokenReplyMessage m = ValidateAuthTokenReplyMessage.fromJson(message);
					  if (m != null) {
						  processValidateAuthTokenReply(m);
					  }
					  break;
				  case UserLeftMessage.USER_LEFT:
					  UserLeftMessage ulm = UserLeftMessage.fromJson(message);
					  if (ulm != null) {
					//	  processUserLeftMessage(ulm);
					  }
					  break;
				}
			}
		}		
	}
	
	private void handleWhiteboarMessage(String message) {
		
	}
	
	
	private void processValidateAuthTokenReply(ValidateAuthTokenReplyMessage msg) {
		  Map<String, Object> args = new HashMap<String, Object>();  
		  args.put("userId", msg.userId);
		  args.put("valid", msg.valid);	    
		  
		  Map<String, Object> message = new HashMap<String, Object>();
		  Gson gson = new Gson();
	  	  message.put("msg", gson.toJson(args));
	  	  
	  	  System.out.println("RedisPubSubMessageHandler - handleValidateAuthTokenReply \n" + message.get("msg") + "\n");
	  	  DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "validateAuthTokenReply", message);
		  service.sendMessage(m);	 
	}
	
	
	private void processUserLeftMessage(UserLeftMessage msg) {
		  Map<String, Object> args = new HashMap<String, Object>();	
		  args.put("user", msg.user);
			
		  Map<String, Object> message = new HashMap<String, Object>();
		  Gson gson = new Gson();
	  	  message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - handleUserLeft \n" + message.get("msg") + "\n");
			
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "participantLeft", message);
	  	  service.sendMessage(m); 
	}
}
