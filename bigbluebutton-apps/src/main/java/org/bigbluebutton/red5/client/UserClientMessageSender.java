package org.bigbluebutton.red5.client;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import org.bigbluebutton.common.messages.BroadcastLayoutMessage;
import org.bigbluebutton.common.messages.GetCurrentLayoutReplyMessage;
import org.bigbluebutton.common.messages.GetRecordingStatusReplyMessage;
import org.bigbluebutton.common.messages.GetUsersReplyMessage;
import org.bigbluebutton.common.messages.LockLayoutMessage;
import org.bigbluebutton.common.messages.PresenterAssignedMessage;
import org.bigbluebutton.common.messages.RecordingStatusChangedMessage;
import org.bigbluebutton.common.messages.UserEmojiStatusMessage;
import org.bigbluebutton.common.messages.UserJoinedMessage;
import org.bigbluebutton.common.messages.UserJoinedVoiceMessage;
import org.bigbluebutton.common.messages.UserLeftMessage;
import org.bigbluebutton.common.messages.UserLeftVoiceMessage;
import org.bigbluebutton.common.messages.UserListeningOnlyMessage;
import org.bigbluebutton.common.messages.UserSharedWebcamMessage;
import org.bigbluebutton.common.messages.UserStatusChangedMessage;
import org.bigbluebutton.common.messages.UserUnsharedWebcamMessage;
import org.bigbluebutton.common.messages.UserVoiceMutedMessage;
import org.bigbluebutton.common.messages.UserVoiceTalkingMessage;
import org.bigbluebutton.common.messages.ValidateAuthTokenReplyMessage;
import org.bigbluebutton.common.messages.ValidateAuthTokenTimeoutMessage;
import org.bigbluebutton.common.messages.UserEjectedFromMeetingMessage;
import org.bigbluebutton.messages.BreakoutRoomClosed;
import org.bigbluebutton.messages.BreakoutRoomJoinURL;
import org.bigbluebutton.messages.BreakoutRoomStarted;
import org.bigbluebutton.messages.BreakoutRoomsList;
import org.bigbluebutton.messages.BreakoutRoomsTimeRemainingUpdate;
import org.bigbluebutton.messages.TimeRemainingUpdate;
import org.bigbluebutton.messages.UpdateBreakoutUsers;
import org.bigbluebutton.red5.client.messaging.BroadcastClientMessage;
import org.bigbluebutton.red5.client.messaging.ConnectionInvokerService;
import org.bigbluebutton.red5.client.messaging.DirectClientMessage;
import org.red5.logging.Red5LoggerFactory;
import org.slf4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class UserClientMessageSender {
  private static Logger log = Red5LoggerFactory.getLogger(UserClientMessageSender.class, "bigbluebutton");

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
            break;
          case UserEmojiStatusMessage.USER_EMOJI_STATUS:
            UserEmojiStatusMessage urhm = UserEmojiStatusMessage.fromJson(message);
            if (urhm != null) {
              processUserEmojiStatusMessage(urhm);
            }
            break;
          case UserListeningOnlyMessage.USER_LISTENING_ONLY:
            UserListeningOnlyMessage ulom = UserListeningOnlyMessage.fromJson(message);
            if (ulom != null) {
              processUserListeningOnlyMessage(ulom);
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
          case GetCurrentLayoutReplyMessage.GET_CURRENT_LAYOUT_REPLY:
            processGetCurrentLayoutReplyMessage(message);
            break;
          case BroadcastLayoutMessage.BROADCAST_LAYOUT:
            processBroadcastLayoutMessage(message);
            break;
          case LockLayoutMessage.LOCK_LAYOUT:
            processLockLayoutMessage(message);
            break;
          case UserEjectedFromMeetingMessage.USER_EJECTED_FROM_MEETING:
            processUserEjectedFromMeetingMessage(message);
            break;
          case BreakoutRoomsList.NAME:
        	BreakoutRoomsList brl = gson.fromJson(message, BreakoutRoomsList.class);
            if (brl != null) {
                processBreakoutRoomsList(brl);
              }
        	break;
          case BreakoutRoomJoinURL.NAME:
        	BreakoutRoomJoinURL brjum = gson.fromJson(message, BreakoutRoomJoinURL.class);
            if (brjum != null) {
              processBreakoutRoomJoinURL(brjum);
            }
        	break;
          case TimeRemainingUpdate.NAME:
        	TimeRemainingUpdate trum = gson.fromJson(message, TimeRemainingUpdate.class);
            if (trum != null) {
              processTimeRemainingUpdate(trum);
            }
        	break;
          case BreakoutRoomsTimeRemainingUpdate.NAME:
              BreakoutRoomsTimeRemainingUpdate brtru = gson.fromJson(message, BreakoutRoomsTimeRemainingUpdate.class);
              if (brtru != null) {
                processBreakoutRoomsTimeRemainingUpdate(brtru);
              }
              break;
          case UpdateBreakoutUsers.NAME:
        	UpdateBreakoutUsers ubum = gson.fromJson(message, UpdateBreakoutUsers.class);
        	if (ubum != null) {
        	  processUpdateBreakoutUsers(ubum);
            }
        	break;
          case BreakoutRoomStarted.NAME:
        	BreakoutRoomStarted brsm = gson.fromJson(message, BreakoutRoomStarted.class);
        	if (brsm != null) {
                processBreakoutRoomStarted(brsm);
              }
        	break;
          case BreakoutRoomClosed.NAME:
        	BreakoutRoomClosed brcm = gson.fromJson(message, BreakoutRoomClosed.class);
          	if (brcm != null) {
                  processBreakoutRoomClosed(brcm);
                }
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
  
  private void processLockLayoutMessage(String message) {
    LockLayoutMessage msg = LockLayoutMessage.fromJson(message);
    if (msg != null) {
      Map<String, Object> args = new HashMap<String, Object>();  
      args.put("locked", msg.locked);
      args.put("setById", msg.setByUserid);	    
      
      Iterator<String> usersIter = msg.users.iterator();
      while (usersIter.hasNext()){
        String user = usersIter.next();
        DirectClientMessage m = new DirectClientMessage(msg.meetingId, user, "layoutLocked", args);
        service.sendMessage(m);
      }
    }
  }

  private void processBroadcastLayoutMessage(String message) {
    BroadcastLayoutMessage msg = BroadcastLayoutMessage.fromJson(message);
    if (msg != null) {
      Map<String, Object> args = new HashMap<String, Object>();  
      args.put("locked", msg.locked);
      args.put("setByUserID", msg.setByUserid);	    
      args.put("layout", msg.layout);
  
      Iterator<String> usersIter = msg.users.iterator();
      while (usersIter.hasNext()){
        String user = usersIter.next();
        DirectClientMessage m = new DirectClientMessage(msg.meetingId, user, "syncLayout", args);
        service.sendMessage(m);
      }
    }
  }

  private void processGetCurrentLayoutReplyMessage(String message) {
    GetCurrentLayoutReplyMessage msg = GetCurrentLayoutReplyMessage.fromJson(message);
    if (msg != null) {
      Map<String, Object> args = new HashMap<String, Object>();  
      args.put("locked", msg.locked);
      args.put("setById", msg.setByUserid);	    
      args.put("layout", msg.layout);
 
      DirectClientMessage m = new DirectClientMessage(msg.meetingId, msg.requestedByUserid, "getCurrentLayoutResponse", args);
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
  
    log.info("validateAuthTokenReply - " + gson.toJson(args));
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
  
    log.info("validateAuthTokenTimedOut - " + gson.toJson(args));
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
    log.info("joinMeetingReply - " + gson.toJson(args));

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

  private void processUserListeningOnlyMessage(UserListeningOnlyMessage msg) {	  			
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("userId", msg.userId);
    args.put("listenOnly", msg.listenOnly);
 
    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

    BroadcastClientMessage m = new BroadcastClientMessage(msg.meetingId, "user_listening_only", message);
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
  
  private void processUserJoinedVoiceMessage(UserJoinedVoiceMessage msg) {	  	
    Map<String, Object> args = new HashMap<String, Object>();	
    args.put("meetingID", msg.meetingId);
    args.put("user", msg.user);

    Map<String, Object> message = new HashMap<String, Object>();
    Gson gson = new Gson();
    message.put("msg", gson.toJson(args));

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
  
  private void processBreakoutRoomsList(BreakoutRoomsList msg) {
	  Map<String, Object> args = new HashMap<String, Object>();	
	  args.put("meetingId", msg.payload.meetingId);
	  args.put("rooms", msg.payload.rooms);
	  args.put("roomsReady", msg.payload.roomsReady);
	  
	  Map<String, Object> message = new HashMap<String, Object>();
      Gson gson = new Gson();
      message.put("msg", gson.toJson(args));
      
      BroadcastClientMessage m = new BroadcastClientMessage(msg.payload.meetingId, "breakoutRoomsList", message);
      service.sendMessage(m);
  }
  
  private void processBreakoutRoomJoinURL(BreakoutRoomJoinURL msg) {
	  Map<String, Object> args = new HashMap<String, Object>();	
	  args.put("parentMeetingId", msg.payload.parentMeetingId);
	  args.put("breakoutMeetingId", msg.payload.breakoutMeetingId);
	  args.put("userId", msg.payload.userId);
	  args.put("redirectJoinURL", msg.payload.redirectJoinURL);
	  args.put("noRedirectJoinURL", msg.payload.noRedirectJoinURL);
	  
	  Map<String, Object> message = new HashMap<String, Object>();
      Gson gson = new Gson();
      message.put("msg", gson.toJson(args));
      
      DirectClientMessage m = new DirectClientMessage(msg.payload.parentMeetingId, msg.payload.userId, "breakoutRoomJoinURL", message);
      service.sendMessage(m);
  }
  
  private void processTimeRemainingUpdate(TimeRemainingUpdate msg) {
	  Map<String, Object> args = new HashMap<String, Object>();	
	  args.put("meetingId", msg.payload.meetingId);
	  args.put("timeRemaining", msg.payload.timeRemaining);
	  
	  Map<String, Object> message = new HashMap<String, Object>();
	  Gson gson = new Gson();
	  message.put("msg", gson.toJson(args));
      
	  BroadcastClientMessage m = new BroadcastClientMessage(msg.payload.meetingId, "timeRemainingUpdate", message);
      service.sendMessage(m);
  }
  
  private void processBreakoutRoomsTimeRemainingUpdate(BreakoutRoomsTimeRemainingUpdate msg) {
      Map<String, Object> args = new HashMap<String, Object>(); 
      args.put("meetingId", msg.payload.meetingId);
      args.put("timeRemaining", msg.payload.timeRemaining);
      
      Map<String, Object> message = new HashMap<String, Object>();
      Gson gson = new Gson();
      message.put("msg", gson.toJson(args));
      
      BroadcastClientMessage m = new BroadcastClientMessage(msg.payload.meetingId, "breakoutRoomsTimeRemainingUpdate", message);
      service.sendMessage(m); 
  }
  
  private void processUpdateBreakoutUsers(UpdateBreakoutUsers msg) {
	  Map<String, Object> args = new HashMap<String, Object>();	
	  args.put("parentMeetingId", msg.payload.parentMeetingId);
	  args.put("breakoutMeetingId", msg.payload.breakoutMeetingId);
	  args.put("users", msg.payload.users);
	  
	  Map<String, Object> message = new HashMap<String, Object>();
	  Gson gson = new Gson();
	  message.put("msg", gson.toJson(args));
      
	  BroadcastClientMessage m = new BroadcastClientMessage(msg.payload.parentMeetingId, "updateBreakoutUsers", message);
      service.sendMessage(m);
  }
  
  private void processBreakoutRoomStarted(BreakoutRoomStarted msg) {
	  Map<String, Object> args = new HashMap<String, Object>();	
	  args.put("breakoutMeetingId", msg.payload.meetingId);
      args.put("parentMeetingId", msg.payload.parentMeetingId);
      args.put("externalMeetingId", msg.payload.externalMeetingId);
	  args.put("sequence", msg.payload.sequence);
	  args.put("name", msg.payload.name);
	  
	  Map<String, Object> message = new HashMap<String, Object>();
	  Gson gson = new Gson();
	  message.put("msg", gson.toJson(args));
	  
	  BroadcastClientMessage m = new BroadcastClientMessage(msg.payload.parentMeetingId, "breakoutRoomStarted", message);
      service.sendMessage(m);
  }
  
  private void processBreakoutRoomClosed(BreakoutRoomClosed msg) {
	  Map<String, Object> args = new HashMap<String, Object>();	
	  args.put("breakoutMeetingId", msg.payload.meetingId);
	  args.put("parentMeetingId", msg.payload.parentMeetingId);
	  
	  Map<String, Object> message = new HashMap<String, Object>();
	  Gson gson = new Gson();
	  message.put("msg", gson.toJson(args));
	  
	  BroadcastClientMessage m = new BroadcastClientMessage(msg.payload.parentMeetingId, "breakoutRoomClosed", message);
      service.sendMessage(m);
  }
}
