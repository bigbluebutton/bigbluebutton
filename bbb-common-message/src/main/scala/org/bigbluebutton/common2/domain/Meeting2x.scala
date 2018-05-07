package org.bigbluebutton.common2.domain

case class ConfigProps(defaultConfigToken: String, config: String)

case class DurationProps(duration: Int, createdTime: Long, createdDate: String,  maxInactivityTimeoutMinutes: Int,
warnMinutesBeforeMax:     Int, meetingExpireIfNoUserJoinedInMinutes: Int,
                         meetingExpireWhenLastUserLeftInMinutes: Int)

case class MeetingProp(name: String, extId: String, intId: String, isBreakout: Boolean)

case class BreakoutProps(parentId: String, sequence: Int, freeJoin: Boolean, breakoutRooms: Vector[String])

case class PasswordProp(moderatorPass: String, viewerPass: String)

case class RecordProp(record: Boolean, autoStartRecording: Boolean, allowStartStopRecording: Boolean)

case class WelcomeProp(welcomeMsgTemplate: String, welcomeMsg: String, modOnlyMessage: String)

case class VoiceProp(telVoice: String, voiceConf: String, dialNumber: String, muteOnStart: Boolean)

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

case class SimpleAnswerOutVO(id: Int, key: String)
case class SimplePollOutVO(id: String, answers: Array[SimpleAnswerOutVO])
case class SimpleVoteOutVO(id: Int, key: String, numVotes: Int)
case class SimplePollResultOutVO(id: String, answers: Array[SimpleVoteOutVO], numRespondents: Int, numResponders: Int)
case class Responder(userId: String, name: String)
case class AnswerVO(id: Int, key: String, text: Option[String], responders: Option[Array[Responder]])
case class QuestionVO(id: Int, questionType: String, multiResponse: Boolean, questionText: Option[String], answers: Option[Array[AnswerVO]])
case class PollVO(id: String, questions: Array[QuestionVO], title: Option[String], started: Boolean, stopped: Boolean, showResult: Boolean)

case class UserVO(id: String, externalId: String, name: String, role: String,
                  guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emojiStatus: String,
                  presenter: Boolean, hasStream: Boolean, locked: Boolean, webcamStreams: Set[String],
                  phoneUser: Boolean, voiceUser: VoiceUserVO, listenOnly: Boolean, avatarURL: String,
                  joinedWeb: Boolean)

case class VoiceUserVO(userId: String, webUserId: String, callerName: String,
                       callerNum: String, joined: Boolean, locked: Boolean, muted: Boolean,
                       talking: Boolean, avatarURL: String, listenOnly: Boolean)
