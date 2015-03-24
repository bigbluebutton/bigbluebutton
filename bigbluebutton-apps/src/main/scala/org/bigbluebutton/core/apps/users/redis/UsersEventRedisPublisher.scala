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
        case msg: GetPermissionsSettingReply    => handleGetPermissionsSettingReply(msg)
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
        case msg: UserVoiceMuted                => handleUserVoiceMuted(msg)
        case msg: UserVoiceTalking              => handleUserVoiceTalking(msg)
        case msg: MuteVoiceUser                 => handleMuteVoiceUser(msg)
	      case msg: EjectVoiceUser                => handleEjectVoiceUser(msg)
        case msg: UserJoinedVoice               => handleUserJoinedVoice(msg)
        case msg: UserLeftVoice                 => handleUserLeftVoice(msg)
        case msg: IsMeetingMutedReply           => handleIsMeetingMutedReply(msg)
        case msg: UserListeningOnly             => handleUserListeningOnly(msg)
	    case _ => //println("Unhandled message in UsersClientMessageSender")
	  }
	}

  private def handleDisconnectAllUsers(msg: DisconnectAllUsers) {
    val json = UsersMessageToJsonConverter.disconnectAllUsersToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)
  }

  private def handleDisconnectUser(msg: DisconnectUser) {
    val json = UsersMessageToJsonConverter.disconnectUserToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)  
  }

  private def handlePermissionsSettingInitialized(msg: PermissionsSettingInitialized) {
    val json = UsersMessageToJsonConverter.permissionsSettingInitializedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)  
  }

  private def handleNewPermissionsSetting(msg: NewPermissionsSetting) {
    val json = UsersMessageToJsonConverter.newPermissionsSettingToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)  
  }
  
  private def handleUserLocked(msg: UserLocked) {
    val json = UsersMessageToJsonConverter.userLockedToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json)  
  }
  
  private def handleGetPermissionsSettingReply(msg: GetPermissionsSettingReply) {
    val json = UsersMessageToJsonConverter.getPermissionsSettingReplyToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json) 
  }

  private def handleUserRegistered(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_MEETING_CHANNEL, json) 
  }
        
  private def handleUserStatusChange(msg: UserStatusChange) {
    val json = UsersMessageToJsonConverter.userStatusChangeToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)		
	}
  
  private def handleUserRaisedHand(msg: UserRaisedHand) {
    val json = UsersMessageToJsonConverter.userRaisedHandToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
  }
  
  private def handleUserLoweredHand(msg: UserLoweredHand) {
    val json = UsersMessageToJsonConverter.userLoweredHandToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
  }
  
  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    val json = UsersMessageToJsonConverter.userSharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
  
  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    val json = UsersMessageToJsonConverter.userUnsharedWebcamToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleGetUsersReply(msg: GetUsersReply) {   
    val json = UsersMessageToJsonConverter.getUsersReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleUserJoinedVoice(msg: UserJoinedVoice) {
    val json = UsersMessageToJsonConverter.userJoinedVoice(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
  
  private def handleUserVoiceMuted(msg: UserVoiceMuted) {
    val json = UsersMessageToJsonConverter.userVoiceMuted(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
  
  private def handleUserVoiceTalking(msg: UserVoiceTalking) {
    val json = UsersMessageToJsonConverter.userVoiceTalking(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }

  private def handleMuteVoiceUser(msg: MuteVoiceUser) {
    val json = UsersMessageToJsonConverter.muteVoiceUserToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)    
  }
    
  private def handleEjectVoiceUser(msg: EjectVoiceUser) {
    val json = UsersMessageToJsonConverter.ejectVoiceUserToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
  
  private def handleUserLeftVoice(msg: UserLeftVoice) {
    val json = UsersMessageToJsonConverter.userLeftVoiceToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
  
  private def handleIsMeetingMutedReply(msg: IsMeetingMutedReply) {
    val json = UsersMessageToJsonConverter.isMeetingMutedReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
  
  private def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    val json = UsersMessageToJsonConverter.recordingStatusChangedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
  }
  
  private def handleGetRecordingStatusReply(msg: GetRecordingStatusReply) {
    val json = UsersMessageToJsonConverter.getRecordingStatusReplyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)    
  }
  
  private def handleValidateAuthTokenReply(msg: ValidateAuthTokenReply) {    
    val json = UsersMessageToJsonConverter.validateAuthTokenReplyToJson(msg)
//    println("************** Publishing [" + json + "] *******************")
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)  		
  }
  
	private def handleUserJoined(msg: UserJoined) {
    val json = UsersMessageToJsonConverter.userJoinedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
	}
	
	private def handleRegisteredUser(msg: UserRegistered) {
    val json = UsersMessageToJsonConverter.userRegisteredToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)
	}
		
	private def handleUserLeft(msg: UserLeft) {
    val json = UsersMessageToJsonConverter.userLeftToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
	}
	
	private def handlePresenterAssigned(msg: PresenterAssigned) {	  
    val json = UsersMessageToJsonConverter.presenterAssignedToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
  }
  
	private def handleEndAndKickAll(msg: EndAndKickAll) {
    val json = UsersMessageToJsonConverter.endAndKickAllToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)	
  }
  
	private def handleUserListeningOnly(msg: UserListeningOnly) {
    val json = UsersMessageToJsonConverter.userListeningOnlyToJson(msg)
    service.send(MessagingConstants.FROM_USERS_CHANNEL, json)		  
	}
}