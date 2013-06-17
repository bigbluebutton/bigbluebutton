package org.bigbluebutton.core.api

object Role extends Enumeration {
	type Role = Value
	val MODERATOR = Value("MODERATOR")
	val VIEWER = Value("VIEWER")
}

case class Presenter(presenterID: String, presenterName: String, assignedBy: String)
case class UserVO(userID: String, externUserID: String, name: String, role: String, raiseHand: Boolean, presenter: Boolean, hasStream: Boolean)
case class MeetingConfig(name: String, id: MeetingID, passwords: MeetingPasswords, welcomeMsg: String, logoutUrl: String,
	maxUsers: Int, record: Boolean=false, duration: MeetingDuration,
	defaultAvatarURL: String, defaultConfigToken: String)

case class MeetingName(name: String)
case class MeetingID(internal:String, external: String)
case class VoiceConfig(telVoice: String, webVoice: String, dialNumber: String)
case class MeetingPasswords(moderatorPass: String, viewerPass: String)
case class MeetingDuration(duration: Int = 0, createdTime: Long = 0, startTime: Long = 0, endTime: Long = 0)