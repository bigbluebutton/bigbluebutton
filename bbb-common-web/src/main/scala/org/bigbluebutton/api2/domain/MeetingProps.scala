package org.bigbluebutton.api2.domain


import org.bigbluebutton.api.domain.{Config, User}

case class ConfigProps(defaultConfigToken: String,
                       configs: collection.immutable.Map[String, Config])
case class DurationProps(duration: Int,
                         createdTime: Long,
                         startTime: Long,
                         endTime: Long)
case class MeetingProp(name: String,
                       extId: String,
                       intId: String,
                       parentId: String,
                       sequence: Int,
                       isBreakout: Boolean)
case class PasswordProp(moderatorPass: String,
                        viewerPass: String)
case class RecordProp(record: Boolean,
                      autoStartRecording: Boolean,
                      allowStartStopRecording: Boolean)
case class WelcomeProp(welcomeMsgTemplate: String,
                       welcomeMsg: String,
                       modOnlyMessage: String)
case class VoiceProp(telVoice: String,
                     webVoice: String,
                     dialNumber: String)
case class UsersProp(maxUsers: Int,
                     webcamsOnlyForModerator: Boolean,
                     guestPolicy: String,
                     userHasJoined: Boolean,
                     userCustomData: collection.immutable.Map[String, AnyRef],
                     users: collection.immutable.Map[String, User],
                     registeredUsers: collection.immutable.Map[String, Long])
class MeetingProps {

}
