package org.bigbluebutton.core.api

object Role extends Enumeration {
	type Role = Value
	val MODERATOR = Value("MODERATOR")
	val VIEWER = Value("VIEWER")
}

case class Presenter(
  presenterID: String, 
  presenterName: String, 
  assignedBy: String)

case class User(
  id: String,
  externId: String,
  name: String,
  moderator: Boolean,
  avatarUrl: String,
  logoutUrl: String,
  presenter: Boolean,
  callerId: CallerId,
  phoneCaller: Boolean,
  handRaised: Boolean,
  muted: Boolean,
  talking: Boolean
)
  
case class CallerId(
  name: String,
  number: String
)  

case class Permissions(
  disableCam: Boolean = false,
  disableMic: Boolean = false,
  disablePrivChat: Boolean = false,
  disablePubChat: Boolean = false,
  lockedLayout:Boolean = false
)

case class RegisteredUser (
    id: String, 
    externId: String,
    name: String, 
    role: Role.Role,
    authToken: String
)

case class Voice(
  id: String,
  webId: String,
  callId: CallerId,
  phoningIn: Boolean,
  joined: Boolean,
  locked: Boolean,
  muted: Boolean, 
  talking: Boolean
)

case class UserVO(
  userID: String, 
  externUserID: String, 
  name: String, 
  role: Role.Role, 
  raiseHand: Boolean, 
  presenter: Boolean, 
  hasStream: Boolean, 
  locked: Boolean, 
  webcamStream: String, 
  phoneUser: Boolean,
  voiceUser: VoiceUser,
  listenOnly: Boolean,
  permissions: Permissions = new Permissions())

case class VoiceUser(userId: String, 
  webUserId: String, 
  callerName: String, 
  callerNum: String,
  joined: Boolean, 
  locked: Boolean, 
  muted: Boolean, 
  talking: Boolean)                  
                  
case class MeetingConfig(name: String, 
  id: MeetingID, 
  passwords: MeetingPasswords, 
  welcomeMsg: String, 
  logoutUrl: String,
  maxUsers: Int, 
  record: Boolean=false, 
  duration: MeetingDuration,
  defaultAvatarURL: String, 
  defaultConfigToken: String)

case class MeetingName(name: String)
    
case class MeetingID(internal:String, external: String)
    
case class VoiceConfig(telVoice: String, webVoice: String, dialNumber: String)
    
case class MeetingPasswords(moderatorPass: String, viewerPass: String)
    
case class MeetingDuration(duration: Int = 0, createdTime: Long = 0, 
   startTime: Long = 0, endTime: Long = 0)