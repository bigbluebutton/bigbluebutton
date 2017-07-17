package org.bigbluebutton.red5.client;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.bigbluebutton.common.messages.GuestPolicyChangedMessage;
import org.bigbluebutton.common.messages.GetGuestPolicyReplyMessage;
import org.bigbluebutton.common.messages.GetRecordingStatusReplyMessage;
import org.bigbluebutton.common.messages.GetUsersReplyMessage;
import org.bigbluebutton.common.messages.GuestAccessDeniedMessage;
import org.bigbluebutton.common.messages.PresenterAssignedMessage;
import org.bigbluebutton.common.messages.RecordingStatusChangedMessage;
import org.bigbluebutton.common.messages.UserEmojiStatusMessage;
import org.bigbluebutton.common.messages.UserJoinedMessage;
import org.bigbluebutton.common.messages.UserLeftMessage;
import org.bigbluebutton.common.messages.UserSharedWebcamMessage;
import org.bigbluebutton.common.messages.UserStatusChangedMessage;
import org.bigbluebutton.common.messages.UserRoleChangeMessage;
import org.bigbluebutton.common.messages.UserUnsharedWebcamMessage;
import org.bigbluebutton.common.messages.ValidateAuthTokenReplyMessage;
import org.bigbluebutton.common.messages.ValidateAuthTokenTimeoutMessage;
import org.bigbluebutton.common.messages.UserEjectedFromMeetingMessage;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.IConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;
import org.slf4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UserClientMessageSender {

  private IConnectionInvokerService service;

  public UserClientMessageSender(IConnectionInvokerService service) {
    this.service = service;
  }

  public void handleUsersMessage(String message) {
    JsonParser parser = new JsonParser();
    JsonObject obj = (JsonObject) parser.parse(message);

    if (obj.has("header") && obj.has("payload")) {
      JsonObject header = (JsonObject) obj.get("header");

      if (header.has("name")) {
    	// Used for JSON unmarshalling
      	Gson gson = new Gson();
      	
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
          case UserRoleChangeMessage.USER_ROLE_CHANGE:
            UserRoleChangeMessage urcm = UserRoleChangeMessage.fromJson(message);
            if (urcm != null) {
              processUserRoleChangeMessage(urcm);
            }
            break;
          case UserEmojiStatusMessage.USER_EMOJI_STATUS:
            UserEmojiStatusMessage urhm = UserEmojiStatusMessage.fromJson(message);
            if (urhm != null) {
              processUserEmojiStatusMessage(urhm);
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
          case GetGuestPolicyReplyMessage.GET_GUEST_POLICY_REPLY:
            GetGuestPolicyReplyMessage ggprm = GetGuestPolicyReplyMessage.fromJson(message);
            if (ggprm != null) {
              processGetGuestPolicyReplyMessage(ggprm);
            }
            break;
          case GuestPolicyChangedMessage.GUEST_POLICY_CHANGED:
            GuestPolicyChangedMessage gpcm = GuestPolicyChangedMessage.fromJson(message);
            if (gpcm != null) {
              processGuestPolicyChangedMessage(gpcm);
            }
            break;
          case GuestAccessDeniedMessage.GUEST_ACCESS_DENIED:
            GuestAccessDeniedMessage gadm = GuestAccessDeniedMessage.fromJson(message);
            if (gadm != null) {
              processGuestAccessDeniedMessage(gadm);
            }
            break;
          case UserEjectedFromMeetingMessage.USER_EJECTED_FROM_MEETING:
            processUserEjectedFromMeetingMessage(message);
            break;
        }
      }
    }
  }

  private void processUserEjectedFromMeetingMessage(String message) {
    UserEjectedFromMeetingMessage msg = UserEjectedFromMeetingMessage.fromJson(message);
    if (msg != null) {
      Map<String, Object> args = new HashMap<String, Object>();  
      args.put("ejectedBy", msg.ejectedBy);
      System.out.println("**** User [" + msg.userId + "] was ejected by [" + msg.ejectedBy + "]");  
      DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "userEjectedFromMeeting", args);
      service.sendMessage(m);
    }
  }

  private void processValidateAuthTokenReply(ValidateAuthTokenReplyMessage msg) {
    Map<String, Object> args = new HashMap<String, Object>();  
    args.put("userId", msg.userId);
    args.put("valid", msg.valid);	    
  
    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

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

    DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "validateAuthTokenTimedOut", message);
    service.sendMessage(m);	 
  }

  private void processUserLeftMessage(UserLeftMessage msg) {
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("user", msg.user);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));
    
    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "participantLeft", message);
    service.sendMessage(m); 
  }

  private void processUserJoinedMessage(UserJoinedMessage msg) {	  	
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("user", msg.user);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    String userId = msg.user.get("userId").toString();

    DirectClientMessage jmr = new DirectClientMessage(msg.meetingId, userId, "joinMeetingReply", message);
    service.sendMessage(jmr);
   
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

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "assignPresenterCallback", message);
    service.sendMessage(m);	
  }

  private void processUserEmojiStatusMessage(UserEmojiStatusMessage msg) {	  			
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("userId", msg.userId);
    args.put("emojiStatus", msg.emojiStatus);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userEmojiStatus", message);
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

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "participantStatusChange", message);
    service.sendMessage(m);
  }

  private void processUserRoleChangeMessage(UserRoleChangeMessage msg) {
    Map<String, Object> args = new HashMap<String, Object>();
    args.put("userID", msg.userId);
    args.put("role", msg.role);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "participantRoleChange", message);
    service.sendMessage(m);
  }

  private void processUserSharedWebcamMessage(UserSharedWebcamMessage msg) {	  	
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("userId", msg.userId);
    args.put("webcamStream", msg.stream);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userSharedWebcam", message);  
    service.sendMessage(m);
  }

  private void processUserUnsharedWebcamMessage(UserUnsharedWebcamMessage msg) {	  	
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("userId", msg.userId);
    args.put("webcamStream", msg.stream);

    String timeStamp = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSZ").format(Calendar.getInstance().getTime());
    args.put("serverTimestamp", timeStamp );

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "userUnsharedWebcam", message);
    service.sendMessage(m);
  }

  private void processRecordingStatusChangedMessage(RecordingStatusChangedMessage msg) {	  	
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("userId", msg.userId);
    args.put("recording", msg.recording);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

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

    DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "getUsersReply", message);
    service.sendMessage(m);
  }

  private void processGetGuestPolicyReplyMessage(GetGuestPolicyReplyMessage msg) {
    Map<String, Object> args = new HashMap<String, Object>();
    args.put("guestPolicy", msg.guestPolicy.toString());

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requesterId, "get_guest_policy_reply", message);
    service.sendMessage(m);
  }

  private void processGuestPolicyChangedMessage(GuestPolicyChangedMessage msg) {
    Map<String, Object> args = new HashMap<String, Object>();
    args.put("guestPolicy", msg.guestPolicy.toString());

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "guest_policy_changed", message);
    service.sendMessage(m);
  }

  private void processGuestAccessDeniedMessage(GuestAccessDeniedMessage msg) {
    Map<String, Object> args = new HashMap<String, Object>();
    args.put("userId", msg.userId);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.userId, "guest_access_denied", message);
    service.sendMessage(m);
  }
}
