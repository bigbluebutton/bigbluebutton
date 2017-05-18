package org.bigbluebutton.api2.domain


import org.bigbluebutton.api.domain.{Config}

case class ConfigProps(defaultConfigToken: String, configs: collection.immutable.Map[String, Config])

case class DurationProps(duration: Int, createdTime: Long, startTime: Long, endTime: Long)

case class MeetingProp(name: String, extId: String, intId: String, parentId: String, sequence: Int, isBreakout: Boolean)

case class PasswordProp(moderatorPass: String, viewerPass: String)

case class RecordProp(record: Boolean, autoStartRecording: Boolean, allowStartStopRecording: Boolean)

case class WelcomeProp(welcomeMsgTemplate: String, welcomeMsg: String, modOnlyMessage: String)

case class VoiceProp(telVoice: String, webVoice: String, dialNumber: String)

case class UsersProp(maxUsers: Int, webcamsOnlyForModerator: Boolean, guestPolicy: String, userHasJoined: Boolean)

case class Meeting2(meetingProp: MeetingProp, durationProps: DurationProps, password: PasswordProp,
                   recordProp: RecordProp, welcomeProp: WelcomeProp, voiceProp: VoiceProp, usersProp: UsersProp)
