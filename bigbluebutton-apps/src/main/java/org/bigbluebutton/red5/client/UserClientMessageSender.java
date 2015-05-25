package org.bigbluebutton.red5.client;

import java.util.HashMap;
import java.util.Map;

import org.bigbluebutton.conference.meeting.messaging.red5.BroadcastClientMessage;
import org.bigbluebutton.conference.meeting.messaging.red5.ConnectionInvokerService;
import org.bigbluebutton.conference.meeting.messaging.red5.DirectClientMessage;
import org.bigbluebutton.red5.pub.messages.GetRecordingStatusReplyMessage;
import org.bigbluebutton.red5.pub.messages.GetUsersReplyMessage;
import org.bigbluebutton.red5.pub.messages.PresenterAssignedMessage;
import org.bigbluebutton.red5.pub.messages.RecordingStatusChangedMessage;
import org.bigbluebutton.red5.sub.messages.UserJoinedMessage;
import org.bigbluebutton.red5.sub.messages.UserJoinedVoiceMessage;
import org.bigbluebutton.red5.sub.messages.UserLeftMessage;
import org.bigbluebutton.red5.sub.messages.UserLeftVoiceMessage;
import org.bigbluebutton.red5.sub.messages.UserListeningOnlyMessage;
import org.bigbluebutton.red5.sub.messages.UserLoweredHandMessage;
import org.bigbluebutton.red5.sub.messages.UserRaisedHandMessage;
import org.bigbluebutton.red5.sub.messages.UserSharedWebcamMessage;
import org.bigbluebutton.red5.sub.messages.UserStatusChangedMessage;
import org.bigbluebutton.red5.sub.messages.UserUnsharedWebcamMessage;
import org.bigbluebutton.red5.sub.messages.UserVoiceMutedMessage;
import org.bigbluebutton.red5.sub.messages.UserVoiceTalkingMessage;
import org.bigbluebutton.red5.sub.messages.ValidateAuthTokenReplyMessage;
import org.bigbluebutton.red5.sub.messages.ValidateAuthTokenTimeoutMessage;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class UserClientMessageSender {
	private ConnectionInvokerService service;
	
	public UserClientMessageSender(ConnectionInvokerService service) {
		this.service = service;
	}
	
	public void handleUsersMessage(String message) {
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
				  case ValidateAuthTokenTimeoutMessage.VALIDATE_AUTH_TOKEN_TIMEOUT:
					  ValidateAuthTokenTimeoutMessage vattm = ValidateAuthTokenTimeoutMessage.fromJson(message);
					  if (vattm != null) {
						  processValidateAuthTokenTimeoutMessage(vattm);
					  }
					  break;
				  case UserLeftMessage.USER_LEFT:
					  UserLeftMessage ulm = UserLeftMessage.fromJson(message);
					  if (ulm != null) {
						  processUserLeftMessage(ulm);
					  }
					  break;
				  case UserJoinedMessage.USER_JOINED:
					  UserJoinedMessage ujm = UserJoinedMessage.fromJson(message);
					  if (ujm != null) {
						  processUserJoinedMessage(ujm);
					  }
					  break;
				  case PresenterAssignedMessage.PRESENTER_ASSIGNED:
					  PresenterAssignedMessage pam = PresenterAssignedMessage.fromJson(message);
					  if (pam != null) {
						  processPresenterAssignedMessage(pam);
					  }
					  break;
				  case UserStatusChangedMessage.USER_STATUS_CHANGED:
					  UserStatusChangedMessage usm = UserStatusChangedMessage.fromJson(message);
					  if (usm != null) {
						  processUserStatusChangedMessage(usm);
					  }
					  break;
				  case UserRaisedHandMessage.USER_RAISED_HAND:
					  UserRaisedHandMessage urhm = UserRaisedHandMessage.fromJson(message);
					  if (urhm != null) {
						  processUserRaisedHandMessage(urhm);
					  }
					  break;
				  case UserListeningOnlyMessage.USER_LISTENING_ONLY:
					  UserListeningOnlyMessage ulom = UserListeningOnlyMessage.fromJson(message);
					  if (ulom != null) {
						  processUserListeningOnlyMessage(ulom);
					  }
					  break;
				  case UserLoweredHandMessage.USER_LOWERED_HAND:
					  UserLoweredHandMessage ulhm = UserLoweredHandMessage.fromJson(message);
					  if (ulhm != null) {
						  processUserLoweredHandMessage(ulhm);
					  }
					  break;
				  case UserSharedWebcamMessage.USER_SHARED_WEBCAM:
					  UserSharedWebcamMessage uswm = UserSharedWebcamMessage.fromJson(message);
					  if (uswm != null) {
						  processUserSharedWebcamMessage(uswm);
					  }
					  break;
				  case UserUnsharedWebcamMessage.USER_UNSHARED_WEBCAM:
					  UserUnsharedWebcamMessage uuwm = UserUnsharedWebcamMessage.fromJson(message);
					  if (uuwm != null) {
						  processUserUnsharedWebcamMessage(uuwm);
					  }
					  break;
				  case UserJoinedVoiceMessage.USER_JOINED_VOICE:
					  UserJoinedVoiceMessage ujvm = UserJoinedVoiceMessage.fromJson(message);
					  if (ujvm != null) {
						  processUserJoinedVoiceMessage(ujvm);
					  }
					  break;
				  case UserLeftVoiceMessage.USER_LEFT_VOICE:
					  UserLeftVoiceMessage ulvm = UserLeftVoiceMessage.fromJson(message);
					  if (ulvm != null) {
						  processUserLeftVoiceMessage(ulvm);
					  }
					  break;
				  case UserVoiceMutedMessage.USER_VOICE_MUTED:
					  UserVoiceMutedMessage uvmm = UserVoiceMutedMessage.fromJson(message);
					  if (uvmm != null) {
						  processUserVoiceMutedMessage(uvmm);
					  }
					  break;
				  case UserVoiceTalkingMessage.USER_VOICE_TALKING:
					  UserVoiceTalkingMessage uvtm = UserVoiceTalkingMessage.fromJson(message);
					  if (uvtm != null) {
						  processUserVoiceTalkingMessage(uvtm);
					  }
					  break;
				  case RecordingStatusChangedMessage.RECORDING_STATUS_CHANGED:
					  RecordingStatusChangedMessage rscm = RecordingStatusChangedMessage.fromJson(message);
					  if (rscm != null) {
						  processRecordingStatusChangedMessage(rscm);
					  }
					  break;
				  case GetRecordingStatusReplyMessage.Get_RECORDING_STATUS_REPLY:
					  GetRecordingStatusReplyMessage grsrm = GetRecordingStatusReplyMessage.fromJson(message);
					  if (grsrm != null) {
						  processGetRecordingStatusReplyMessage(grsrm);
					  }
					  break;
				  case GetUsersReplyMessage.GET_USERS_REPLY:
					  GetUsersReplyMessage gurm = GetUsersReplyMessage.fromJson(message);
					  if (gurm != null) {
						  processGetUsersReplyMessage(gurm);
					  }
					  break;
				}
			}
		}		
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
	
	private void processValidateAuthTokenTimeoutMessage(ValidateAuthTokenTimeoutMessage msg) {	    
		  Map<String, Object> args = new HashMap<String, Object>();  
		  args.put("userId", msg.userId);
		  args.put("valid", msg.valid);	    
		  
		  Map<String, Object> message = new HashMap<String, Object>();
		  Gson gson = new Gson();
	  	  message.put("msg", gson.toJson(args));
	  	  
	  	  System.out.println("RedisPubSubMessageHandler - processValidateAuthTokenTimeoutMessage \n" + message.get("msg") + "\n");
	  	  DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "validateAuthTokenTimedOut", message);
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

	private void processUserJoinedMessage(UserJoinedMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("user", msg.user);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - joinMeetingReply \n" + message.get("msg") + "\n");
		
	  	String userId = msg.user.get("userId").toString();
	  	
	  	DirectClientMessage jmr = new DirectClientMessage(msg.meetingId, userId, "joinMeetingReply", message);
	  	service.sendMessage(jmr);
		  	  
	  	System.out.println("RedisPubSubMessageHandler - handleUserJoined \n" + message.get("msg") + "\n");
		  	    
		BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "participantJoined", message);
	  	service.sendMessage(m);
	}

	private void processPresenterAssignedMessage(PresenterAssignedMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("newPresenterID", msg.newPresenterId);
		args.put("newPresenterName", msg.newPresenterName);
		args.put("assignedBy", msg.assignedBy);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processPresenterAssignedMessage \n" + message.get("msg") + "\n");
		
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "assignPresenterCallback", message);
		service.sendMessage(m);	
	}
	
	private void processUserRaisedHandMessage(UserRaisedHandMessage msg) {	  			
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userId", msg.userId);
		
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserRaisedHandMessage \n" + message.get("msg") + "\n");
		
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userRaisedHand", message);
		service.sendMessage(m);	
	}
	
	private void processUserListeningOnlyMessage(UserListeningOnlyMessage msg) {	  			
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userId", msg.userId);
		 args.put("listenOnly", msg.listenOnly);
		 
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserListeningOnlyMessage \n" + message.get("msg") + "\n");
		
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "user_listening_only", message);
		service.sendMessage(m);	
	}	
	
	private void processUserLoweredHandMessage(UserLoweredHandMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userId", msg.userId);
		args.put("loweredBy", msg.loweredBy);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserLoweredHandMessage \n" + message.get("msg") + "\n");
		
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userLoweredHand", message);
		service.sendMessage(m);	
	}

	private void processUserStatusChangedMessage(UserStatusChangedMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userID", msg.userId);
		args.put("status", msg.status);
		args.put("value", msg.value);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserStatusChangedMessage \n" + message.get("msg") + "\n");
		
	  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "participantStatusChange", message);
		service.sendMessage(m);
	}

	private void processUserSharedWebcamMessage(UserSharedWebcamMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userId", msg.userId);
		args.put("webcamStream", msg.stream);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserSharedWebcamMessage \n" + message.get("msg") + "\n");
		
	  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userSharedWebcam", message);
		service.sendMessage(m);
	}
	
	private void processUserUnsharedWebcamMessage(UserUnsharedWebcamMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userId", msg.userId);
		args.put("webcamStream", msg.stream);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserUnharedWebcamMessage \n" + message.get("msg") + "\n");
		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userUnsharedWebcam", message);
		service.sendMessage(m);
	}
	
	private void processUserJoinedVoiceMessage(UserJoinedVoiceMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("meetingID", msg.meetingId);
		args.put("user", msg.user);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserJoinedVoiceMessage \n" + message.get("msg") + "\n");
		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userJoinedVoice", message);
		service.sendMessage(m);	
	}
	
	private void processUserLeftVoiceMessage(UserLeftVoiceMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("meetingID", msg.meetingId);
		args.put("user", msg.user);
			
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserLeftVoiceMessage \n" + message.get("msg") + "\n");
		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userLeftVoice", message);
		service.sendMessage(m);	
	}
	
	private void processUserVoiceMutedMessage(UserVoiceMutedMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("meetingID", msg.meetingId);
		args.put("userId", msg.user.get("userId"));
		
		Map<String, Object> vuMap = (Map<String, Object>) msg.user.get("voiceUser");
		
		
		args.put("voiceUserId", (String) vuMap.get("userId"));
		args.put("muted", (Boolean) vuMap.get("muted"));
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserVoiceMutedMessage \n" + message.get("msg") + "\n");
		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "voiceUserMuted", message);
		service.sendMessage(m);		
	}

	private void processUserVoiceTalkingMessage(UserVoiceTalkingMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("meetingID", msg.meetingId);
		args.put("userId", msg.user.get("userId"));
		
		Map<String, Object> vuMap = (Map<String, Object>) msg.user.get("voiceUser");
		
		
		args.put("voiceUserId", (String) vuMap.get("userId"));
		args.put("talking", (Boolean) vuMap.get("talking"));
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processUserVoiceTalkingMessage \n" + message.get("msg") + "\n");
		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "voiceUserTalking", message);
		service.sendMessage(m);		
	}	
	
	private void processRecordingStatusChangedMessage(RecordingStatusChangedMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userId", msg.userId);
		args.put("recording", msg.recording);
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processRecordingStatusChangedMessage \n" + message.get("msg") + "\n");
		  	    
	  	BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "recordingStatusChanged", message);
		service.sendMessage(m);		
	}	
	
	private void processGetRecordingStatusReplyMessage(GetRecordingStatusReplyMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("userId", msg.userId);
		args.put("recording", msg.recording);
		  
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	    
	  	System.out.println("RedisPubSubMessageHandler - processGetRecordingStatusReplyMessage \n" + message.get("msg") + "\n");
		  	    
	  	DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "getRecordingStatusReply", message);
		service.sendMessage(m);		
	}
	
	private void processGetUsersReplyMessage(GetUsersReplyMessage msg) {	  	
		Map<String, Object> args = new HashMap<String, Object>();	
		args.put("count", msg.users.size());
		args.put("users", msg.users);
		
		Map<String, Object> message = new HashMap<String, Object>();
		Gson gson = new Gson();
		message.put("msg", gson.toJson(args));
	  	
		System.out.println("*************************************************************************************\n");
	  	System.out.println("RedisPubSubMessageHandler - processGetUsersReplyMessage \n" + message.get("msg") + "\n");
	  	System.out.println("*************************************************************************************\n");
		  	    
	  	DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "getUsersReply", message);
		service.sendMessage(m);
	}
}
