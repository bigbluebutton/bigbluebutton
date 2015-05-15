package org.bigbluebutton.apps

object Role extends Enumeration {
	type RoleType = Value
	val MODERATOR = Value("MODERATOR")
	val VIEWER = Value("VIEWER")
}

case class Duration(lengthInMinutes: Int, allowExtend: Boolean, maxDuration: Int)
case class VoiceConference(pin: Int, number: Int)
case class PhoneNumber(number: String, description: String)

case class MeetingDescriptor(id: String, name: String,  
                       record: Boolean, welcomeMessage: String, 
                       logoutUrl: String, avatarUrl: String,
                       numUsers: Int, duration: Duration, 
                       voiceConf: VoiceConference, phoneNumbers: Seq[PhoneNumber], 
                       metadata: Map[String, String])
                       
case class MeetingIdAndName(id: String, name: String)  
case class Session(id: String, meeting: MeetingIdAndName)

