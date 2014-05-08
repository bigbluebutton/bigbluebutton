package org.bigbluebutton.core.apps.users.redis

import org.bigbluebutton.conference.service.messaging.redis.MessageSender
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.messaging.MessagingConstants
import com.google.gson.Gson

class UsersEventRedisPublisher(service: MessageSender) extends OutMessageListener2 {

  def handleMessage(msg: IOutMessage) {
	  msg match {

        case msg: DisconnectAllUsers            => handleDisconnectAllUsers(msg)
        case msg: DisconnectUser                => handleDisconnectUser(msg)
        case msg: PermissionsSettingInitialized => handlePermissionsSettingInitialized(msg)
        case msg: NewPermissionsSetting         => handleNewPermissionsSetting(msg)
        case msg: UserLocked                    => handleUserLocked(msg)
        case msg: UsersLocked                   => handleUsersLocked(msg)
        case msg: GetPermissionsSettingReply    => handleGetPermissionsSettingReply(msg)
        case msg: IsMeetingLockedReply          => handleIsMeetingLockedReply(msg)
        case msg: UserRegistered                => handleUserRegistered(msg)
        case msg: UserLeft                      => handleUserLeft(msg)
        case msg: PresenterAssigned             => handlePresenterAssigned(msg)
        case msg: EndAndKickAll                 => handleEndAndKickAll(msg)
        case msg: GetUsersReply                 => handleGetUsersReply(msg)
        case msg: ValidateAuthTokenReply        => handleValidateAuthTokenReply(msg)
        case msg: UserJoined                    => handleUserJoined(msg)
        case msg: UserRaisedHand                => handleUserRaisedHand(msg)
        case msg: UserLoweredHand               => handleUserLoweredHand(msg)
        case msg: UserSharedWebcam              => handleUserSharedWebcam(msg)
        case msg: UserUnsharedWebcam            => handleUserUnsharedWebcam(msg)
        case msg: UserStatusChange              => handleUserStatusChange(msg)
        case msg: MuteVoiceUser                 => handleMuteVoiceUser(msg)
        case msg: UserVoiceMuted                => handleUserVoiceMuted(msg)
        case msg: UserVoiceTalking              => handleUserVoiceTalking(msg)
        case msg: EjectVoiceUser                => handleEjectVoiceUser(msg)
        case msg: UserJoinedVoice               => handleUserJoinedVoice(msg)
        case msg: UserLeftVoice                 => handleUserLeftVoice(msg)
        case msg: IsMeetingMutedReply           => handleIsMeetingMutedReply(msg)
	    case _ => //println("Unhandled message in UsersClientMessageSender")
	  }
	}

  private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
    val json = UsersMessageToJsonConverter.disconnectAllUsersToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectUser(msg: DisconnectUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.DISCONNECT_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING DISCONNECT USER *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }

  private def handlePermissionsSettingInitialized(msg: PermissionsSettingInitialized) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.LOCKED, msg.locked)
    payload.put(Constants.SETTINGS, msg.settings.toString()) //#todo not tested

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PERMISSION_SETTING_INITIALIZED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING PERMISSIONS SETTING INIIALIZED *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }

  private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.SETTINGS, msg.settings.toString()) //#todo not tested

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.NEW_PERMISSION_SETTINGS)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING NEW PERMISSIONS SETTING *****************")
   // dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLocked(msg: UserLocked) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    payload.put(Constants.LOCKED, msg.lock)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_LOCKED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING USER LOCKED *****************")
   // dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUsersLocked(msg: UsersLocked) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.EXCEPT_USERS, msg.exceptUsers.toString()) 
    payload.put(Constants.LOCKED, msg.lock)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USERS_LOCKED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING USERS LOCKED *****************")
  //  dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetPermissionsSettingReply(msg: GetPermissionsSettingReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_PERMISSION_SETTINGS_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING GET PERMISSIONS SETTING REPLY *****************")
  //  dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleIsMeetingLockedReply(msg: IsMeetingLockedReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.IS_MEETING_LOCKED_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING IS MEETING LOCKED REPLY *****************")
  //  dispatcher.dispatch(buildJson(header, payload))
  }

  private def handleUserRegistered(msg: UserRegistered) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER, msg.user.toString()) 
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_REGISTERED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING USER REGISTERED *****************")
  //  dispatcher.dispatch(buildJson(header, payload))
    println("end of USER REGISTERED")
  }
    
  private def handleAssignPresenter(msg: AssignPresenter) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.NEW_PRESENTER_ID, msg.newPresenterID)
    payload.put(Constants.NEW_PRESENTER_NAME, msg.newPresenterName)
    payload.put(Constants.ASSIGNED_BY, msg.assignedBy)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.ASSIGN_PRESENTER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)     

    println("***** DISPATCHING ASSIGN PRESENTER *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
    
  private def handleUserStatusChange(msg: UserStatusChange) {
    val json = UsersMessageToJsonConverter.userStatusChangeToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)		
	}
  
  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.MUTE, msg.mute)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.MUTE_VOICE_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING MUTE VOICE USER *****************")
//    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserRaisedHand(msg: UserRaisedHand) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RAISE_HAND, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_RAISED_HAND)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING USER RAISED HAND *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLoweredHand(msg: UserLoweredHand) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RAISE_HAND, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.LOWERED_BY, msg.loweredBy)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_LOWERED_HAND)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING USER LOWERED HAND *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_SHARED_WEBCAM)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING USER SHARED WEBCAM *****************")
  //  dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_UNSHARED_WEBCAM)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING USER UNSHARED WEBCAM *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }

  private def handleGetUsersReply(msg: GetUsersReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 

//    val users = new java.util.ArrayList[java.util.HashMap[String, Object]];
 //   msg.users.foreach(uvo => {    
 //     users.add(userToMap(uvo))
 //   })
    
 //   payload.put(Constants.USERS, users)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_USERS_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    
    println("***** DISPATCHING GET USERS REPLY *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }

  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_JOINED_VOICE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING USER JOINED VOICE *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserVoiceMuted(msg: UserVoiceMuted) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_VOICE_MUTED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING USER VOICE MUTED *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserVoiceTalking(msg: UserVoiceTalking) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_VOICE_TALKING)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING USER VOICE TALKING *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.EJECT_VOICE_USER)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING EJECT VOICE USER *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleUserLeftVoice(msg: UserLeftVoice) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, msg.user.toString())
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.USER_LEFT_VOICE)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING USER LEFT VOICE *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.MUTED, msg.meetingMuted)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.IS_MEETING_MUTED_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING IS MEETING MUTED REPLY *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.RECORDING_STATUS_CHANGED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING RECORDING STATUS CHANGED *****************")
//    dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)

    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_RECORDING_STATUS_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING GET RECORDING STATUS REPLY *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
  private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
		//HEADER
		var header = new java.util.HashMap[String, Any]()
		header.put("name", "validate_auth_token_reply")
		header.put("timestamp", System.currentTimeMillis())

		//PAYLOAD
		var payload = new java.util.HashMap[String, Object]()
		payload.put("correlation_id", msg.correlationId)
		payload.put("valid", msg.valid.toString)
		payload.put("user_id", msg.requesterId)
		payload.put("token", msg.token)
		payload.put("meeting_id", msg.meetingID)  
		
		val gson= new Gson();
		
		var map = new java.util.HashMap[String, Any]()
		map.put("header", header)
		map.put("payload", payload)
		service.send(MessagingConstants.FROM_USERS_CHANNEL, gson.toJson(map));		
  }
  
	private def handleUserJoined(msg: UserJoined) {
    val json = UsersMessageToJsonConverter.userJoinedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
	}
	
	private def handleRegisteredUser(msg: UserRegistered) {
	  val args = new java.util.HashMap[String, Object]();  
	  args.put("userId", msg.user.id);

	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	message.put("msg", gson.toJson(args))
  	  
  	  println("UsersClientMessageSender - handleRegisteredUser \n" + message.get("msg") + "\n")
	}
		
	private def handleUserLeft(msg: UserLeft) {
    val json = UsersMessageToJsonConverter.userLeftToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
	}
	
	private def handlePresenterAssigned(msg: PresenterAssigned) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.NEW_PRESENTER_ID, msg.presenter.presenterID);
    payload.put(Constants.NEW_PRESENTER_NAME, msg.presenter.presenterName);
    payload.put(Constants.ASSIGNED_BY, msg.presenter.assignedBy);
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.PRESENTER_ASSIGNED)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
 
    println("***** DISPATCHING PRESENTER ASSIGNED *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
	private def handleEndAndKickAll(msg: EndAndKickAll) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.END_AND_KICK_ALL)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)

    println("***** DISPATCHING END AND KICK ALL *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }
  
}