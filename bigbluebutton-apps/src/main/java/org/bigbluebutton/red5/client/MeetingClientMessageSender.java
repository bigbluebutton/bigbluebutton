package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.DisconnectAllClientsMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.DisconnectClientMessage;
import org.bigbluebutton.red5.pubsub.messages.Constants;
import org.bigbluebutton.red5.pubsub.messages.DisconnectAllUsersMessage;
import org.bigbluebutton.red5.pubsub.messages.DisconnectUserMessage;
import org.bigbluebutton.red5.pubsub.messages.MeetingEndedMessage;
import org.bigbluebutton.red5.pubsub.messages.MeetingHasEndedMessage;
import org.bigbluebutton.red5.pubsub.messages.MeetingMutedMessage;
import org.bigbluebutton.red5.pubsub.messages.MeetingStateMessage;
import org.bigbluebutton.red5.pubsub.messages.NewPermissionsSettingMessage;
import org.bigbluebutton.red5.pubsub.messages.UserLockedMessage;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class MeetingClientMessageSender {
	private ConnectionInvokerService service;
	
	public MeetingClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handleMeetingMessage(String message) {
		JsonParser parser = new JsonParser();
		JsonObject obj = (JsonObject) parser.parse(message);
		
		if (obj.has("header") && obj.has("payload")) {
			JsonObject header = (JsonObject) obj.get("header");

			if (header.has("name")) {
				String messageName = header.get("name").getAsString();
				switch (messageName) {
				  case DisconnectUserMessage.DISCONNECT_USER:
					  DisconnectUserMessage m = DisconnectUserMessage.fromJson(message);
					  if (m != null) {
						  processDisconnectUserMessage(m);
					  }
					  break;
				  case DisconnectAllUsersMessage.DISCONNECT_All_USERS:
					  DisconnectAllUsersMessage daum = DisconnectAllUsersMessage.fromJson(message);
					  if (daum != null) {
						  processDisconnectAllUsersMessage(daum);
					  }
					  break; 
				  case MeetingEndedMessage.MEETING_ENDED:
					  MeetingEndedMessage mem = MeetingEndedMessage.fromJson(message);
					  if (mem != null) {
						  processMeetingEndedMessage(mem);
					  }
					  break; 
				  case MeetingHasEndedMessage.MEETING_HAS_ENDED:
					  MeetingHasEndedMessage mhem = MeetingHasEndedMessage.fromJson(message);
					  if (mhem != null) {
						  processMeetingHasEndedMessage(mhem);
					  }
					  break;
				  case MeetingStateMessage.MEETING_STATE:
					  MeetingStateMessage msm = MeetingStateMessage.fromJson(message);
					  if (msm != null) {
						  processMeetingStateMessage(msm);
					  }
					  break;
				  case NewPermissionsSettingMessage.NEW_PERMISSIONS_SETTING:
					  NewPermissionsSettingMessage npsm = NewPermissionsSettingMessage.fromJson(message);
					  if (npsm != null) {
						  processNewPermissionsSettingMessage(npsm);
					  }
					  break;
				  case MeetingMutedMessage.MEETING_MUTED:
					  MeetingMutedMessage mmm = MeetingMutedMessage.fromJson(message);
					  if (mmm != null) {
						  processMeetingMutedMessage(mmm);
					  }
					  break;
				  case UserLockedMessage.USER_LOCKED:
					  UserLockedMessage ulm = UserLockedMessage.fromJson(message);
					  if (ulm != null) {
						  processUserLockedMessage(ulm);
					  }
					  break;
				}
			}
		}		
	}

	private void processMeetingHasEndedMessage(MeetingHasEndedMessage msg) {	  	  
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("status", "Meeting has already ended.");   
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
		System.out.println("RedisPubSubMessageHandler - processMeetingHasEndedMessage \n" + message.get("msg") + "\n");

	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "meetingHasEnded", message);
	  	service.sendMessage(m); 
	}
	
	private void processMeetingStateMessage(MeetingStateMessage msg) {	  	  
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("permissions", msg.permissions);
		args.put("meetingMuted", msg.muted);
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
		System.out.println("RedisPubSubMessageHandler - processMeetingStateMessage \n" + message.get("msg") + "\n");

		DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "meetingState", message);
	  	service.sendMessage(m);   
	}
	
	private void processNewPermissionsSettingMessage(NewPermissionsSettingMessage msg) {	  	  
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("disableCam", msg.permissions.get(Constants.PERM_DISABLE_CAM));
		args.put("disableMic", msg.permissions.get(Constants.PERM_DISABLE_MIC));
		args.put("disablePrivChat", msg.permissions.get(Constants.PERM_DISABLE_PRIVCHAT));
		args.put("disablePubChat", msg.permissions.get(Constants.PERM_DISABLE_PUBCHAT));
	    args.put("lockedLayout", msg.permissions.get(Constants.PERM_LOCKED_LAYOUT));
	    args.put("lockOnJoin", msg.permissions.get(Constants.PERM_LOCK_ON_JOIN));
	    args.put("lockOnJoinConfigurable", msg.permissions.get(Constants.PERM_LOCK_ON_JOIN_CONFIG));
		
	    args.put("users", msg.users);
	    
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
		System.out.println("RedisPubSubMessageHandler - processNewPermissionsSettingMessage \n" + message.get("msg") + "\n");

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "permissionsSettingsChanged", message);
	  	service.sendMessage(m);   	 
	}	
	
	private void processMeetingMutedMessage(MeetingMutedMessage msg) {	  	  
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("meetingMuted", msg.muted);
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
		System.out.println("RedisPubSubMessageHandler - processMeetingMutedMessage \n" + message.get("msg") + "\n");

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "meetingMuted", message);
	  	service.sendMessage(m);    
	}
	
	private void processMeetingEndedMessage(MeetingEndedMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("status", "Meeting has been ended.");   
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
		System.out.println("RedisPubSubMessageHandler - handleMeetingEnded \n" + message.get("msg") + "\n");

	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "meetingEnded", message);
	  	service.sendMessage(m); 
	}
	
	private void processDisconnectAllUsersMessage(DisconnectAllUsersMessage msg) {
		System.out.println("RedisPubSubMessageHandler - processDisconnectAllUsersMessage mid=[" + msg.meetingId + "]");
		DisconnectAllClientsMessage dm = new DisconnectAllClientsMessage(msg.meetingId);
		service.sendMessage(dm);	  	 
	}
	
	private void processDisconnectUserMessage(DisconnectUserMessage msg) {
		System.out.println("RedisPubSubMessageHandler - handleDisconnectUser mid=[" + msg.meetingId + "], uid=[" + msg.userId + "]\n");
		  
		DisconnectClientMessage m = new DisconnectClientMessage(msg.meetingId, msg.userId);
		service.sendMessage(m);	  	 
	}
	
	private void processUserLockedMessage(UserLockedMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
	     args.put("meetingID", msg.meetingId);
	     args.put("user", msg.userId);
	     args.put("lock", msg.locked);
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserLockedMessage \n" + message.get("msg") + "\n");
		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userLocked", message);
		service.sendMessage(m);
	}
}
