package org.bigbluebutton.api.messaging;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.bigbluebutton.api.messaging.messages.KeepAliveReply;
import org.bigbluebutton.api.messaging.messages.MeetingDestroyed;
import org.bigbluebutton.api.messaging.messages.MeetingEnded;
import org.bigbluebutton.api.messaging.messages.MeetingStarted;
import org.bigbluebutton.api.messaging.messages.UserJoined;
import org.bigbluebutton.api.messaging.messages.UserLeft;
import org.bigbluebutton.api.messaging.messages.UserStatusChanged;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;

public class MeetingMessageHandler implements MessageHandler {
	private static Logger log = LoggerFactory.getLogger(MeetingMessageHandler.class);
	
	private Set<MessageListener> listeners;
	
	public void setMessageListeners(Set<MessageListener> listeners) {
		this.listeners = listeners;
	}
	
	public void handleMessage(String pattern, String channel, String message) {	
	  Gson gson = new Gson();

		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		if (obj.has("header")) return; // we don't currently handle this type of message
		
		JsonObject messageObject = (JsonObject) obj.get("message");
		
	  if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {		
		  HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
		  String messageId = map.get("messageID");

		  for (MessageListener listener : listeners) {
			  if(MessagingConstants.MEETING_STARTED_EVENT.equalsIgnoreCase(messageId)) {
				  String meetingId = map.get("meetingID");
				  listener.handle(new MeetingStarted(meetingId));
			  } else if(MessagingConstants.MEETING_ENDED_EVENT.equalsIgnoreCase(messageId)) {
				  String meetingId = map.get("meetingID");
				  listener.handle(new MeetingEnded(meetingId));
			  } else if (MessagingConstants.MEETING_DESTROYED_EVENT.equalsIgnoreCase(messageId)) {
				  String meetingId = map.get("meetingID");
				  log.info("Received a meeting destroyed message for meeting id=[{}]", meetingId);
				  listener.handle(new MeetingDestroyed(meetingId));
			  } 
		  }
	  } else if (channel.equalsIgnoreCase(MessagingConstants.FROM_SYSTEM_CHANNEL)) {		
		  HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
		  String messageId = map.get("messageID");

		  for (MessageListener listener : listeners) {
			  if (MessagingConstants.KEEP_ALIVE_REPLY_EVENT.equalsIgnoreCase(messageId)){
				  String pongId = map.get("aliveID");
				  listener.handle(new KeepAliveReply(pongId));
			  } 
		  }
		 } else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {		
			  HashMap<String,String> map = gson.fromJson(message, new TypeToken<Map<String, String>>() {}.getType());
			  String messageId = map.get("messageID");

			  for (MessageListener listener : listeners) {
				  if (MessagingConstants.USER_JOINED_EVENT.equalsIgnoreCase(messageId)){
			  	  String meetingId = map.get("meetingID");
				    String userId = map.get("internalUserID");
				    String externalUserId = map.get("externalUserID");
				    String name = map.get("fullname");
				    String role = map.get("role");			
					  listener.handle(new UserJoined(meetingId, userId, externalUserId, name, role));
			    } else if(MessagingConstants.USER_STATUS_CHANGE_EVENT.equalsIgnoreCase(messageId)){
				    String userId = map.get("internalUserID");
				    String status = map.get("status");
				    String value = map.get("value");
				    String meetingId = map.get("meetingID");
					  listener.handle(new UserStatusChanged(meetingId, userId, status, value));
			    } else if(MessagingConstants.USER_LEFT_EVENT.equalsIgnoreCase(messageId)){
				    String userId = map.get("internalUserID");
				    String meetingId = map.get("meetingID");
					  listener.handle(new UserLeft(meetingId, userId));
			    }
			  }
		  } 
	}
}
