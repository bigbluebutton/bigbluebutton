package org.bigbluebutton.common2.domain

case class DurationProps(duration: Int, createdTime: Long, createdDate: String,
                         meetingExpireIfNoUserJoinedInMinutes: Int, meetingExpireWhenLastUserLeftInMinutes: Int,
                         userInactivityInspectTimerInMinutes: Int, userInactivityThresholdInMinutes: Int,
                         userActivitySignResponseDelayInMinutes: Int,
                         endWhenNoModerator:                     Boolean, endWhenNoModeratorDelayInMinutes: Int)

case class MeetingProp(
    name:                                   String,
    extId:                                  String,
    intId:                                  String,
    meetingCameraCap:                       Int,
    maxPinnedCameras:                       Int,
    isBreakout:                             Boolean,
    disabledFeatures:                       Vector[String],
    notifyRecordingIsOn:                    Boolean,
    presentationUploadExternalDescription:  String,
    presentationUploadExternalUrl:          String,
)

case class BreakoutProps(
    parentId:           String,
    sequence:           Int,
    freeJoin:           Boolean,
    breakoutRooms:      Vector[String],
    record:             Boolean,
    privateChatEnabled: Boolean,
    captureNotes:       Boolean,
    captureSlides:      Boolean,
    captureNotesFilename: String,
    captureSlidesFilename: String,
)

case class PasswordProp(moderatorPass: String, viewerPass: String, learningDashboardAccessToken: String)

case class RecordProp(record: Boolean, autoStartRecording: Boolean, allowStartStopRecording: Boolean, recordFullDurationMedia: Boolean, keepEvents: Boolean)

case class WelcomeProp(welcomeMsg: String, welcomeMsgForModerators: String)

case class VoiceProp(telVoice: String, voiceConf: String, dialNumber: String, muteOnStart: Boolean)

case class UsersProp(
    maxUsers:                     Int,
    maxUserConcurrentAccesses:    Int,
    webcamsOnlyForModerator:      Boolean,
    userCameraCap:                Int,
    guestPolicy:                  String,
    meetingLayout:                String,
    allowModsToUnmuteUsers:       Boolean,
    allowModsToEjectCameras:      Boolean,
    authenticatedGuest:           Boolean,
    allowPromoteGuestToModerator: Boolean,
    waitingGuestUsersTimeout: Long
)

case class MetadataProp(metadata: collection.immutable.Map[String, String])

case class LockSettingsProps(
    disableCam:             Boolean,
    disableMic:             Boolean,
    disablePrivateChat:     Boolean,
    disablePublicChat:      Boolean,
    disableNotes:           Boolean,
    hideUserList:           Boolean,
    lockOnJoin:             Boolean,
    lockOnJoinConfigurable: Boolean,
    hideViewersCursor:      Boolean,
    hideViewersAnnotation:  Boolean
)

case class SystemProps(
    loginUrl: String,
    logoutUrl: String,
    customLogoURL: String,
    customDarkLogoURL: String,
    bannerText: String,
    bannerColor: String,
)

case class GroupProps(
    groupId:    String,
    name:       String,
    usersExtId: Vector[String]
)

case class DefaultProps(
    meetingProp:       MeetingProp,
    breakoutProps:     BreakoutProps,
    durationProps:     DurationProps,
    password:          PasswordProp,
    recordProp:        RecordProp,
    welcomeProp:       WelcomeProp,
    voiceProp:         VoiceProp,
    usersProp:         UsersProp,
    metadataProp:      MetadataProp,
    lockSettingsProps: LockSettingsProps,
    systemProps:       SystemProps,
    groups:            Vector[GroupProps],
    overrideClientSettings: String
)

case class StartEndTimeStatus(startTime: Long, endTime: Long)
case class RecordingStatus(isRecording: Boolean)
case class GuestPolicyStatus(currentGuestPolicy: String)
case class RunningStatus(isRunning: Boolean, isForciblyEnded: Boolean, numUsers: Int)
case class MeetingStatus(startEndTimeStatus: StartEndTimeStatus, recordingStatus: RecordingStatus,
                         guestPolicyStatus: GuestPolicyStatus, userHasJoined: Boolean)

case class Meeting2x(defaultProps: DefaultProps, meetingStatus: MeetingStatus)

case class SimpleAnswerOutVO(id: Int, key: String)
case class SimplePollOutVO(id: String, isMultipleResponse: Boolean, answers: Array[SimpleAnswerOutVO])
case class SimpleVoteOutVO(id: Int, key: String, numVotes: Int)
case class SimplePollResultOutVO(id: String, questionType: String, questionText: Option[String], answers: Array[SimpleVoteOutVO], numRespondents: Int, numResponders: Int)
case class Responder(userId: String, name: String)
case class AnswerVO(id: Int, key: String, text: Option[String], responders: Option[Array[Responder]])
case class QuestionVO(id: Int, questionType: String, multiResponse: Boolean, questionText: Option[String], answers: Option[Array[AnswerVO]])
case class PollVO(id: String, questions: Array[QuestionVO], title: Option[String], started: Boolean, stopped: Boolean, showResult: Boolean, isSecret: Boolean)

case class UserVO(id: String, externalId: String, name: String, role: String,
                  guest: Boolean, authed: Boolean, guestStatus: String, emojiStatus: String,
                  presenter: Boolean, hasStream: Boolean, locked: Boolean, webcamStreams: Set[String],
                  phoneUser: Boolean, voiceUser: VoiceUserVO, listenOnly: Boolean, avatarURL: String,
                  joinedWeb: Boolean)

case class VoiceUserVO(userId: String, webUserId: String, callerName: String,
                       callerNum: String, joined: Boolean, locked: Boolean, muted: Boolean,
                       talking: Boolean, avatarURL: String, listenOnly: Boolean)
