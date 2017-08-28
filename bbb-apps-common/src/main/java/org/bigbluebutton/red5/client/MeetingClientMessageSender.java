package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.common.messages.Constants;
import org.bigbluebutton.common.messages.DisconnectAllUsersMessage;
import org.bigbluebutton.common.messages.InactivityWarningMessage;
import org.bigbluebutton.common.messages.MeetingEndedMessage;
import org.bigbluebutton.common.messages.MeetingEndingMessage;
import org.bigbluebutton.common.messages.MeetingHasEndedMessage;
import org.bigbluebutton.common.messages.MeetingIsActiveMessage;
import org.bigbluebutton.common.messages.MeetingMutedMessage;
import org.bigbluebutton.common.messages.MeetingStateMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;
import org.bigbluebutton.red5.client.messaging.DisconnectAllClientsMessage;
import org.bigbluebutton.red5.client.messaging.DisconnectClientMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class MeetingClientMessageSender {
	private IConnectionInvokerService service;
	
	public MeetingClientMessageSender(IConnectionInvokerService service) {
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
				  case MeetingMutedMessage.MEETING_MUTED:
					  MeetingMutedMessage mmm = MeetingMutedMessage.fromJson(message);
					  if (mmm != null) {
						  processMeetingMutedMessage(mmm);
					  }
					  break;
				  case InactivityWarningMessage.INACTIVITY_WARNING:
					  InactivityWarningMessage iwm = InactivityWarningMessage.fromJson(message);
					  if (iwm != null) {
						  processInactivityWarningMessage(iwm);
					  }
					  break;
				  case MeetingIsActiveMessage.MEETING_IS_ACTIVE:
					  MeetingIsActiveMessage miam = MeetingIsActiveMessage.fromJson(message);
					  if (miam != null) {
						  processMeetingIsActiveMessage(miam);
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

	private void processInactivityWarningMessage(InactivityWarningMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("status", "Meeting seems inactive.");
		args.put("duration", msg.duration);

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "inactivityWarning", message);
		service.sendMessage(m);
	}

	private void processMeetingIsActiveMessage(MeetingIsActiveMessage msg) {
		Map<String, Object> args = new HashMap<String, Object>();
		args.put("status", "Meeting is active.");

		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));

		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "meetingIsActive", message);
		service.sendMessage(m);
	}
}
