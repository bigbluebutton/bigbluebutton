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
	  wuser += "listenOnly"           -> user.listenOnly

	  val permissions = new scala.collection.mutable.HashMap[String, Any]
	  permissions.put("disableCam", user.permissions.disableCam)
	  permissions.put("disableMic", user.permissions.disableMic)
	  permissions.put("disablePrivChat", user.permissions.disablePrivChat)
	  permissions.put("disablePubChat", user.permissions.disablePubChat)	  
	  permissions.put("lockedLayout", user.permissions.lockedLayout)
	  
      wuser.put("permissions", permissions)
      
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

	private def registeredUserToMap(user: RegisteredUser):java.util.Map[String, Any] = {
	  val wuser = new scala.collection.mutable.HashMap[String, Any]
	  wuser += "userid"               -> user.id
	  wuser += "extern_userid"        -> user.externId
	  wuser += "name"                 -> user.name
	  wuser += "role"                 -> user.role.toString()	  
	  wuser += "authToken"            -> user.authToken
	  
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
    payload.put(Constants.SETTINGS, msg.permissions.toString()) //#todo not tested
 
    val header = Util.buildHeader(MessageNames.PERMISSION_SETTING_INITIALIZED, msg.version, None)
    Util.buildJson(header, payload)
  }

  def newPermissionsSettingToJson(msg: NewPermissionsSetting):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put("disableCam", msg.permissions.disableCam)
	payload.put("disableMic", msg.permissions.disableMic)
	payload.put("disablePrivChat", msg.permissions.disablePrivChat)
	payload.put("disablePubChat", msg.permissions.disablePubChat)

    val users = new java.util.ArrayList[java.util.Map[String, Any]]
    msg.applyTo.foreach(uvo => {    
      users.add(userToMap(uvo))
    })
		
    payload.put("users", users)
    
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
    payload.put(Constants.USER, registeredUserToMap(msg.user)) 
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = Util.buildHeader(MessageNames.USER_REGISTERED, msg.version, None)
    Util.buildJson(header, payload)
  }
    
  
  def userRaisedHandToJson(msg: UserRaisedHand):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RAISE_HAND, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)

    val header = Util.buildHeader(MessageNames.USER_RAISED_HAND, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def userLoweredHandToJson(msg: UserLoweredHand):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RAISE_HAND, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.LOWERED_BY, msg.loweredBy)

    val header = Util.buildHeader(MessageNames.USER_LOWERED_HAND, msg.version, None)
    Util.buildJson(header, payload)
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
    
  def userSharedWebcamToJson(msg: UserSharedWebcam):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)

		val header = Util.buildHeader(MessageNames.USER_SHARED_WEBCAM, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def userUnsharedWebcamToJson(msg: UserUnsharedWebcam):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userID)
    payload.put(Constants.STREAM, msg.stream)

		val header = Util.buildHeader(MessageNames.USER_UNSHARED_WEBCAM, msg.version, None)
    Util.buildJson(header, payload)
  }

  def getUsersReplyToJson(msg: GetUsersReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.REQUESTER_ID, msg.requesterID) 

    val users = new java.util.ArrayList[java.util.Map[String, Any]];
    msg.users.foreach(uvo => {    
      users.add(userToMap(uvo))
    })
    
    payload.put(Constants.USERS, users)
    
		val header = Util.buildHeader(MessageNames.GET_USERS_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }

  def userJoinedVoice(msg: UserJoinedVoice):String =  {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
		val header = Util.buildHeader(MessageNames.USER_JOINED_VOICE, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def userVoiceMuted(msg: UserVoiceMuted):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
		val header = Util.buildHeader(MessageNames.USER_VOICE_MUTED, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def userVoiceTalking(msg: UserVoiceTalking):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)

		val header = Util.buildHeader(MessageNames.USER_VOICE_TALKING, msg.version, None)
    Util.buildJson(header, payload)
  }

  def muteVoiceUserToJson(msg: MuteVoiceUser):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.MUTE, msg.mute) 
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
		val header = Util.buildHeader(MessageNames.EJECT_VOICE_USER, msg.version, None)
    Util.buildJson(header, payload)
  }
    
  def ejectVoiceUserToJson(msg: EjectVoiceUser):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    
		val header = Util.buildHeader(MessageNames.EJECT_VOICE_USER, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def userLeftVoiceToJson(msg: UserLeftVoice):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.USER, userToMap(msg.user))
    payload.put(Constants.VOICE_CONF, msg.confNum)
    
		val header = Util.buildHeader(MessageNames.USER_LEFT_VOICE, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def isMeetingMutedReplyToJson(msg: IsMeetingMutedReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    payload.put(Constants.REQUESTER_ID, msg.requesterID)
    payload.put(Constants.MUTED, msg.meetingMuted)

		val header = Util.buildHeader(MessageNames.IS_MEETING_MUTED_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def recordingStatusChangedToJson(msg: RecordingStatusChanged):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)
 
		val header = Util.buildHeader(MessageNames.RECORDING_STATUS_CHANGED, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def getRecordingStatusReplyToJson(msg: GetRecordingStatusReply):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded)
    payload.put(Constants.USER_ID, msg.userId)
    payload.put(Constants.RECORDING, msg.recording)

		val header = Util.buildHeader(MessageNames.GET_RECORDING_STATUS_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }
  
  def validateAuthTokenReplyToJson(msg: ValidateAuthTokenReply):String = {
		val payload = new java.util.HashMap[String, Any]()
		payload.put(Constants.REPLY_TO, msg.correlationId)
		payload.put(Constants.VALID, msg.valid.toString)
		payload.put(Constants.USER_ID, msg.requesterId)
		payload.put(Constants.AUTH_TOKEN, msg.token)
		payload.put(Constants.MEETING_ID, msg.meetingID)  
		
		val header = Util.buildHeader(MessageNames.VALIDATE_AUTH_TOKEN_REPLY, msg.version, None)
    Util.buildJson(header, payload)
  }
  
	def userJoinedToJson(msg: UserJoined):String = {
	  val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_JOINED, msg.version, None)
    Util.buildJson(header, payload)
	}
	
		
	def userLeftToJson(msg: UserLeft):String = {
	  val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put("user", userToMap(msg.user))

    val header = Util.buildHeader(MessageNames.USER_LEFT, msg.version, None)
    Util.buildJson(header, payload)
	}
	
	def presenterAssignedToJson(msg: PresenterAssigned):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.NEW_PRESENTER_ID, msg.presenter.presenterID);
    payload.put(Constants.NEW_PRESENTER_NAME, msg.presenter.presenterName);
    payload.put(Constants.ASSIGNED_BY, msg.presenter.assignedBy);
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = Util.buildHeader(MessageNames.PRESENTER_ASSIGNED, msg.version, None)
    Util.buildJson(header, payload)
  }
  
	def endAndKickAllToJson(msg: EndAndKickAll):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID)
    payload.put(Constants.RECORDED, msg.recorded) 
    
    val header = Util.buildHeader(MessageNames.END_AND_KICK_ALL, msg.version, None)
    Util.buildJson(header, payload)
  }  
	
	def userListeningOnlyToJson(msg: UserListeningOnly):String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingID) 
    payload.put(Constants.USER_ID, msg.userID) 
    payload.put(Constants.LISTEN_ONLY, msg.listenOnly) 
    
    val header = Util.buildHeader(MessageNames.USER_LISTEN_ONLY, msg.version, None)
    Util.buildJson(header, payload)	  
	}
}