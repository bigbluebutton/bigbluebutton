package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.DisconnectAllUsersMessage;
import org.bigbluebutton.common.messages.DisconnectUserMessage;
import org.bigbluebutton.common.messages.MeetingEndedMessage;
import org.bigbluebutton.common.messages.MeetingEndingMessage;
import org.bigbluebutton.common.messages.MeetingHasEndedMessage;
import org.bigbluebutton.common.messages.MeetingMutedMessage;
import org.bigbluebutton.common.messages.MeetingStateMessage;
import org.bigbluebutton.common.messages.NewPermissionsSettingMessage;
import org.bigbluebutton.common.messages.UserLockedMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;
import org.bigbluebutton.red5.client.messaging.DisconnectAllClientsMessage;
import org.bigbluebutton.red5.client.messaging.DisconnectClientMessage;

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
				  case MeetingEndingMessage.MEETING_ENDING:
					  MeetingEndingMessage me = MeetingEndingMessage.fromJson(message);
					  if (me != null) {
						  processMeetingEndingMessage(me);
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
	  	  
		DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "meetingState", message);
	  	service.sendMessage(m);   
	}
	
	private void processNewPermissionsSettingMessage(NewPermissionsSettingMessage msg) {	  	  
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("disableCam", msg.permissions.get(Constants.PERM_DISABLE_CAM));
		args.put("disableMic", msg.permissions.get(Constants.PERM_DISABLE_MIC));
		args.put("disablePrivateChat", msg.permissions.get(Constants.PERM_DISABLE_PRIVCHAT));
		args.put("disablePublicChat", msg.permissions.get(Constants.PERM_DISABLE_PUBCHAT));
	    args.put("lockedLayout", msg.permissions.get(Constants.PERM_LOCKED_LAYOUT));
	    args.put("lockOnJoin", msg.permissions.get(Constants.PERM_LOCK_ON_JOIN));
	    args.put("lockOnJoinConfigurable", msg.permissions.get(Constants.PERM_LOCK_ON_JOIN_CONFIG));
		
	    args.put("users", msg.users);
	    
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "permissionsSettingsChanged", message);
	  	service.sendMessage(m);   	 
	}	
	
	private void processMeetingMutedMessage(MeetingMutedMessage msg) {	  	  
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("meetingMuted", msg.muted);
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "meetingMuted", message);
	  	service.sendMessage(m);    
	}
	
	private void processMeetingEndedMessage(MeetingEndedMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();  
		args.put("status", "Meeting has been ended.");   
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	  
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "meetingEnded", message);
	  	service.sendMessage(m); 
	}
	
	private void processMeetingEndingMessage(MeetingEndingMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("status", "Meeting is ending.");

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "meetingEnding", message);
		service.sendMessage(m);
	}

	private void processDisconnectAllUsersMessage(DisconnectAllUsersMessage msg) {
		DisconnectAllClientsMessage dm = new DisconnectAllClientsMessage(msg.meetingId);
		service.sendMessage(dm);	  	 
	}
	
	private void processDisconnectUserMessage(DisconnectUserMessage msg) {		  
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
	  	    		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userLocked", message);
		service.sendMessage(m);
	}
}
