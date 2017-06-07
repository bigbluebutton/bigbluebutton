package org.bigbluebutton.common2.domain

case class ConfigProps(defaultConfigToken: String, config: String)

case class DurationProps(duration: Int, createdTime: Long, createdDate: String)

case class MeetingProp(name: String, extId: String, intId: String, isBreakout: Boolean)

case class BreakoutProps(parentId: String, sequence: Int, breakoutRooms: Vector[String])

case class PasswordProp(moderatorPass: String, viewerPass: String)

case class RecordProp(record: Boolean, autoStartRecording: Boolean, allowStartStopRecording: Boolean)

case class WelcomeProp(welcomeMsgTemplate: String, welcomeMsg: String, modOnlyMessage: String)

case class VoiceProp(telVoice: String, voiceConf: String, dialNumber: String)

case class UsersProp(maxUsers: Int, webcamsOnlyForModerator: Boolean, guestPolicy: String)

case class MetadataProp(metadata: collection.immutable.Map[String, String])

case class ScreenshareProps(screenshareConf: String, red5ScreenshareIp: String, red5ScreenshareApp: String)

case class DefaultProps(meetingProp: MeetingProp, breakoutProps: BreakoutProps,
                        durationProps: DurationProps, password: PasswordProp,
                        recordProp: RecordProp, welcomeProp: WelcomeProp, voiceProp: VoiceProp,
                        usersProp: UsersProp, metadataProp: MetadataProp, screenshareProps: ScreenshareProps)


case class StartEndTimeStatus(startTime: Long, endTime: Long)
case class RecordingStatus(isRecording: Boolean)
case class GuestPolicyStatus(currentGuestPolicy: String)
case class RunningStatus(isRunning: Boolean, isForciblyEnded: Boolean, numUsers: Int)
case class MeetingStatus(startEndTimeStatus: StartEndTimeStatus, recordingStatus: RecordingStatus,
                         guestPolicyStatus: GuestPolicyStatus, userHasJoined: Boolean)

case class Meeting2x(defaultProps: DefaultProps, meetingStatus: MeetingStatus)
