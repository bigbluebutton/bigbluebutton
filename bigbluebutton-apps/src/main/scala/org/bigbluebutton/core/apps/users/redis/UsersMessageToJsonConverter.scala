package org.bigbluebutton.core.apps.users.redis

import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.messaging.MessagingConstants
import org.bigbluebutton.core.messaging.Util
import com.google.gson.Gson
import org.bigbluebutton.core.api.UserVO
import collection.JavaConverters._
import scala.collection.JavaConversions._

object UsersMessageToJsonConverter {
	private def userToMap(user: UserVO):java.util.Map[String, Any] = {
	  val wuser = new scala.collection.mutable.HashMap[String, Any]
	  wuser += "userid"               -> user.userID
	  wuser += "extern_userid"        -> user.externUserID
	  wuser += "name"                 -> user.name
	  wuser += "role"                 -> user.role.toString()
	  wuser += "raise_hand"           -> user.raiseHand
	  wuser += "presenter"            -> user.presenter
	  wuser += "has_stream"           -> user.hasStream
	  wuser += "locked"               -> user.locked
	  wuser += "webcam_stream"        -> user.webcamStream
	  wuser += "phone_user"           -> user.phoneUser	  
	  
	  val vuser = new scala.collection.mutable.HashMap[String, Any]	  	  
	  vuser += "userid"               -> user.voiceUser.userId
	  vuser += "web_userid"           -> user.voiceUser.webUserId
	  vuser += "callername"           -> user.voiceUser.callerName
	  vuser += "callernum"            -> user.voiceUser.callerNum
	  vuser += "joined"               -> user.voiceUser.joined
	  vuser += "locked"               -> user.voiceUser.locked
	  vuser += "muted"                -> user.voiceUser.muted
	  vuser += "talking"              -> user.voiceUser.talking
	
	  wuser.put("voiceUser", mapAsJavaMap(vuser))	  
	  
	  mapAsJavaMap(wuser)
	}
	
  def disconnectAllUsersToJson(msg: DisconnectAllUsers):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)

    val header = Util.buildHeader(MessageNames.DISCONNECT_ALL_USERS, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def disconnectUserToJson(msg: DisconnectUser):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId)

    val header = Util.buildHeader(MessageNames.DISCONNECT_USER, msg.version, None)
    Util.buildJson(header, payload)
  }

  def permissionsSettingInitializedToJson(msg: PermissionsSettingInitialized):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.LOCKED, msg.locked)
    payload.put(Constants.SETTINGS, msg.settings.toString()) //#todo not tested
 
    val header = Util.buildHeader(MessageNames.PERMISSION_SETTING_INITIALIZED, msg.version, None)
    Util.buildJson(header, payload)
  }

  def newPermissionsSettingToJson(msg: NewPermissionsSetting):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.SETTINGS, msg.settings.toString()) //#todo not tested

    val header = Util.buildHeader(MessageNames.NEW_PERMISSION_SETTINGS, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def userLockedToJson(msg: UserLocked):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    payload.put(Constants.LOCKED, msg.lock)

    val header = Util.buildHeader(MessageNames.USER_LOCKED, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def usersLockedToJson(msg: UsersLocked):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.EXCEPT_USERS, msg.exceptUsers.toString()) 
    payload.put(Constants.LOCKED, msg.lock)

    val header = Util.buildHeader(MessageNames.USERS_LOCKED, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def getPermissionsSettingReplyToJson(msg: GetPermissionsSettingReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 

    val header = Util.buildHeader(MessageNames.GET_PERMISSION_SETTINGS_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def isMeetingLockedReplyToJson(msg: IsMeetingLockedReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userId) 
    
    val header = Util.buildHeader(MessageNames.IS_MEETING_LOCKED_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }

  def userRegisteredToJson(msg: UserRegistered):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER, msg.user.toString()) 
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = Util.buildHeader(MessageNames.USER_REGISTERED, msg.version, None)
    Util.buildJson(header, payload)
  }
    
  
  def handleUserRaisedHand(msg: UserRaisedHand):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RAISE_HAND, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)

    val header = Util.buildHeader(MessageNames.USER_RAISED_HAND, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def handleUserLoweredHand(msg: UserLoweredHand) {
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

  def userStatusChangeToJson(msg: UserStatusChange):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.USER_ID, msg.userID) 
    payload.put(Constants.STATUS, msg.status)
    payload.put(Constants.VALUE, msg.value.toString)

		val header = Util.buildHeader(MessageNames.USER_STATUS_CHANGED, msg.version, None)
    Util.buildJson(header, payload)
	}
    
  def handleUserSharedWebcam(msg: UserSharedWebcam) {
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
  
  def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
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

  def handleGetUsersReply(msg: GetUsersReply) {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 

//    val users = new java.util.ArrayList[java.util.HashMap[String, Object]];
//    msg.users.foreach(uvo => {    
//      users.add(buildUserHashMap(uvo))
//    })
    
 //   payload.put(Constants.USERS, users)
    
    val header = new java.util.HashMap[String, Any]()
    header.put(Constants.NAME, MessageNames.GET_USERS_REPLY)
    header.put(Constants.TIMESTAMP, TimestampGenerator.generateTimestamp)
    
    println("***** DISPATCHING GET USERS REPLY *****************")
 //   dispatcher.dispatch(buildJson(header, payload))
  }

  def handleUserJoinedVoice(msg: UserJoinedVoice) {
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
  
  def handleUserVoiceMuted(msg: UserVoiceMuted) {
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
  
  def handleUserVoiceTalking(msg: UserVoiceTalking) {
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
  
  def handleEjectVoiceUser(msg: EjectVoiceUser) {
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
  
  def handleUserLeftVoice(msg: UserLeftVoice) {
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
  
  def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
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
  
  def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
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
  
  def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
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
  
  def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {
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
//		service.send(MessagingConstants.FROM_USERS_CHANNEL, gson.toJson(map));		
  }
  
	def userJoinedToJson(msg: UserJoined):String = {
	  val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_JOINED, msg.version, None)
    Util.buildJson(header, payload)
	}
	
	def handleRegisteredUser(msg: UserRegistered) {
	  val args = new java.util.HashMap[String, Object]();  
	  args.put("userId", msg.user.id);

	  val message = new java.util.HashMap[String, Object]() 
	  val gson = new Gson();
  	  message.put("msg", gson.toJson(args))
  	  
  	  println("UsersClientMessageSender - handleRegisteredUser \n" + message.get("msg") + "\n")
	}
		
	def userLeftToJson(msg: UserLeft):String = {
	  val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_LEFT, msg.version, None)
    Util.buildJson(header, payload)
	}
	
	def handlePresenterAssigned(msg: PresenterAssigned) {
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
  
	def handleEndAndKickAll(msg: EndAndKickAll) {
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