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
import org.bigbluebutton.common.messages.BbbAppsIsAliveMessage;
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
						
	  if (channel.equalsIgnoreCase(MessagingConstants.FROM_MEETING_CHANNEL)) {	
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");
				JsonObject payload = (JsonObject) obj.get("payload");
				
				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
//					System.out.println("Received [" + messageName + "] message on channel [" + channel + "].");
				  
					  if(MessagingConstants.MEETING_STARTED_EVENT.equalsIgnoreCase(messageName)) {
					  	System.out.println("Handling [" + messageName + "] message.");
						  String meetingId = payload.get("meeting_id").getAsString();
						  for (MessageListener listener : listeners) {
						    listener.handle(new MeetingStarted(meetingId));
						  }
					  } else if(MessagingConstants.MEETING_ENDED_EVENT.equalsIgnoreCase(messageName)) {
					  	System.out.println("Handling [" + messageName + "] message.");
						  String meetingId = payload.get("meeting_id").getAsString();
						  for (MessageListener listener : listeners) {
						    listener.handle(new MeetingEnded(meetingId));
						  }
					  } else if (MessagingConstants.MEETING_DESTROYED_EVENT.equalsIgnoreCase(messageName)) {
					  	System.out.println("Handling [" + messageName + "] message.");
						  String meetingId = payload.get("meeting_id").getAsString();
						  log.info("Received a meeting destroyed message for meeting id=[{}]", meetingId);
						  for (MessageListener listener : listeners) {
						    listener.handle(new MeetingDestroyed(meetingId));
						  }
					  }
				}				
			}
	  } else if (channel.equalsIgnoreCase(MessagingConstants.BBB_APPS_KEEP_ALIVE_CHANNEL)) {
	  	
			if (obj.has("header") && obj.has("payload")) {
				JsonObject header = (JsonObject) obj.get("header");
				JsonObject payload = (JsonObject) obj.get("payload");
				
				if (header.has("name")) {
					String messageName = header.get("name").getAsString();
//					System.out.println("Received [" + messageName + "] message on channel [" + channel + "].");
				  for (MessageListener listener : listeners) {
					  if (BbbAppsIsAliveMessage.BBB_APPS_IS_ALIVE.equalsIgnoreCase(messageName)){
						  BbbAppsIsAliveMessage msg = BbbAppsIsAliveMessage.fromJson(message);
						  listener.handle(new KeepAliveReply(msg.startedOn, msg.timestamp));
					  } 
				  }
				}				
			}
		 } else if (channel.equalsIgnoreCase(MessagingConstants.FROM_USERS_CHANNEL)) {	
				if (obj.has("header") && obj.has("payload")) {
					JsonObject header = (JsonObject) obj.get("header");
					JsonObject payload = (JsonObject) obj.get("payload");
					
					if (header.has("name")) {
						String messageName = header.get("name").getAsString();
						System.out.println("Received [" + messageName + "] message on channel [" + channel + "].");
					  
						if (MessagingConstants.USER_JOINED_EVENT.equalsIgnoreCase(messageName)) {
              System.out.println("Handling [" + messageName + "] message.");
							String meetingId = payload.get("meeting_id").getAsString();
							JsonObject user = (JsonObject) payload.get("user");
							
							String userid = user.get("userid").getAsString();
							String externuserid = user.get("extern_userid").getAsString();
							String username = user.get("name").getAsString();
							String role = user.get("role").getAsString();
							
							for (MessageListener listener : listeners) {
								listener.handle(new UserJoined(meetingId, userid, externuserid, username, role));
							}
						} else if(MessagingConstants.USER_STATUS_CHANGE_EVENT.equalsIgnoreCase(messageName)) {
						 	System.out.println("Handling [" + messageName + "] message.");
						  String meetingId = payload.get("meeting_id").getAsString();
						  String userid = payload.get("userid").getAsString();
						  String status = payload.get("status").getAsString();
						  String value = payload.get("value").getAsString();
						  for (MessageListener listener : listeners) {
						  	listener.handle(new UserStatusChanged(meetingId, userid, status, value));
						  }
						} else if (MessagingConstants.USER_LEFT_EVENT.equalsIgnoreCase(messageName)) {
						 	System.out.println("Handling [" + messageName + "] message.");
							String meetingId = payload.get("meeting_id").getAsString();
							JsonObject user = (JsonObject) payload.get("user");
							
							String userid = user.get("userid").getAsString();
						  for (MessageListener listener : listeners) {
						  	listener.handle(new UserLeft(meetingId, userid));
						  }
						}
					}				
				}
		  } 
	}
}
