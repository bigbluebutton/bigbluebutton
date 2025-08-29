package org.bigbluebutton.common2.msgs

object RegisterUserReqMsg { val NAME = "RegisterUserReqMsg" }
case class RegisterUserReqMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   RegisterUserReqMsgBody
) extends BbbCoreMsg
case class RegisterUserReqMsgBody(meetingId: String, intUserId: String, name: String, firstName: String, lastName: String,
                                  role: String, extUserId: String, authToken: String, sessionToken: String, avatarURL: String,
                                  webcamBackgroundURL: String, bot: Boolean, guest: Boolean, authed: Boolean,
                                  guestStatus: String, excludeFromDashboard: Boolean, enforceLayout: String,
                                  logoutUrl: String, userMetadata: Map[String, String])

object UserRegisteredRespMsg { val NAME = "UserRegisteredRespMsg" }
case class UserRegisteredRespMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   UserRegisteredRespMsgBody
) extends BbbCoreMsg
case class UserRegisteredRespMsgBody(meetingId: String, userId: String, name: String,
                                     role: String, excludeFromDashboard: Boolean, registeredOn: Long)

object RegisterUserSessionTokenReqMsg { val NAME = "RegisterUserSessionTokenReqMsg" }
case class RegisterUserSessionTokenReqMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   RegisterUserSessionTokenReqMsgBody
) extends BbbCoreMsg
case class RegisterUserSessionTokenReqMsgBody(
    meetingId:           String,
    userId:              String,
    sessionToken:        String,
    sessionName:         String,
    replaceSessionToken: String,
    enforceLayout:       String,
    userSessionMetadata: Map[String, String]
)

object UserSessionTokenRegisteredRespMsg { val NAME = "UserSessionTokenRegisteredRespMsg" }
case class UserSessionTokenRegisteredRespMsg(
    header: BbbCoreHeaderWithMeetingId,
    body:   UserSessionTokenRegisteredRespMsgBody
) extends BbbCoreMsg
case class UserSessionTokenRegisteredRespMsgBody(meetingId: String, userId: String, sessionToken: String)

/**
 * Out Messages
 */

object UserLeftMeetingEvtMsg {
  val NAME = "UserLeftMeetingEvtMsg"
  def apply(meetingId: String, userId: String, body: UserLeftMeetingEvtMsgBody): UserLeftMeetingEvtMsg = {
    val header = BbbClientMsgHeader(UserLeftMeetingEvtMsg.NAME, meetingId, userId)
    UserLeftMeetingEvtMsg(header, body)
  }
}

case class UserLeftMeetingEvtMsg(
    header: BbbClientMsgHeader,
    body:   UserLeftMeetingEvtMsgBody
) extends BbbCoreMsg
case class UserLeftMeetingEvtMsgBody(intId: String, eject: Boolean, ejectedBy: String, reason: String, reasonCode: String)

object UserLeftFlagUpdatedEvtMsg {
  val NAME = "UserLeftFlagUpdatedEvtMsg"
  def apply(meetingId: String, userId: String, body: UserLeftFlagUpdatedEvtMsgBody): UserLeftFlagUpdatedEvtMsg = {
    val header = BbbClientMsgHeader(UserLeftFlagUpdatedEvtMsg.NAME, meetingId, userId)
    UserLeftFlagUpdatedEvtMsg(header, body)
  }
}

case class UserLeftFlagUpdatedEvtMsg(
    header: BbbClientMsgHeader,
    body:   UserLeftFlagUpdatedEvtMsgBody
) extends BbbCoreMsg
case class UserLeftFlagUpdatedEvtMsgBody(intId: String, userLeftFlag: Boolean)

object UserJoinedMeetingEvtMsg {
  val NAME = "UserJoinedMeetingEvtMsg"
  def apply(meetingId: String, userId: String, body: UserJoinedMeetingEvtMsgBody): UserJoinedMeetingEvtMsg = {
    val header = BbbClientMsgHeader(UserJoinedMeetingEvtMsg.NAME, meetingId, userId)
    UserJoinedMeetingEvtMsg(header, body)
  }
}

case class UserJoinedMeetingEvtMsg(
    header: BbbClientMsgHeader,
    body:   UserJoinedMeetingEvtMsgBody
) extends BbbCoreMsg
case class UserJoinedMeetingEvtMsgBody(
    intId:            String,
    extId:            String,
    name:             String,
    role:             String,
    bot:              Boolean,
    guest:            Boolean,
    authed:           Boolean,
    guestStatus:      String,
    reactionEmoji:    String,
    raiseHand:        Boolean,
    away:             Boolean,
    pin:              Boolean,
    presenter:        Boolean,
    locked:           Boolean,
    avatar:           String,
    webcamBackground: String,
    color:            String,
    clientType:       String,
    userMetadata:     Map[String, String]
)

/**
 * Sent by client to get all users in a meeting.
 */
object GetUsersReqMsg { val NAME = "GetUsersReqMsg" }
case class GetUsersReqMsg(header: BbbClientMsgHeader, body: GetUsersReqMsgBody) extends StandardMsg
case class GetUsersReqMsgBody(requesterId: String)

/**
 * Sent by user to get status of recording mark.
 */
object GetRecordingStatusReqMsg { val NAME = "GetRecordingStatusReqMsg" }
case class GetRecordingStatusReqMsg(header: BbbClientMsgHeader, body: GetRecordingStatusReqMsgBody) extends StandardMsg
case class GetRecordingStatusReqMsgBody(requestedBy: String)

/**
 * Sent to user as response to get recording mark.
 */
object GetRecordingStatusRespMsg { val NAME = "GetRecordingStatusRespMsg" }
case class GetRecordingStatusRespMsg(header: BbbClientMsgHeader, body: GetRecordingStatusRespMsgBody) extends BbbCoreMsg
case class GetRecordingStatusRespMsgBody(
    recorded:                Boolean,
    recording:               Boolean,
    recordFullDurationMedia: Boolean,
    requestedBy:             String,
    recordUserAudio:         Boolean,
    recordUserCameras:       Boolean,
    recordUserScreenShare:   Boolean
)

/**
 * Sent by user to start recording mark.
 */
object SetRecordingStatusCmdMsg { val NAME = "SetRecordingStatusCmdMsg" }
case class SetRecordingStatusCmdMsg(header: BbbClientMsgHeader, body: SetRecordingStatusCmdMsgBody) extends StandardMsg
case class SetRecordingStatusCmdMsgBody(recording: Boolean, setBy: String)

/**
 * Sent by user to start recording mark and ignore previous marks
 */
object RecordAndClearPreviousMarkersCmdMsg { val NAME = "RecordAndClearPreviousMarkersCmdMsg" }
case class RecordAndClearPreviousMarkersCmdMsg(header: BbbClientMsgHeader, body: RecordAndClearPreviousMarkersCmdMsgBody) extends StandardMsg
case class RecordAndClearPreviousMarkersCmdMsgBody(recording: Boolean, setBy: String)

/**
 * Sent to all users about start recording mark.
 */
object RecordingStatusChangedEvtMsg { val NAME = "RecordingStatusChangedEvtMsg" }
case class RecordingStatusChangedEvtMsg(header: BbbClientMsgHeader, body: RecordingStatusChangedEvtMsgBody) extends BbbCoreMsg
case class RecordingStatusChangedEvtMsgBody(recording: Boolean, setBy: String)

/**
 * Sent by user to update webcamsOnlyForModerator meeting property.
 */
object UpdateWebcamsOnlyForModeratorCmdMsg { val NAME = "UpdateWebcamsOnlyForModeratorCmdMsg" }
case class UpdateWebcamsOnlyForModeratorCmdMsg(header: BbbClientMsgHeader, body: UpdateWebcamsOnlyForModeratorCmdMsgBody) extends StandardMsg
case class UpdateWebcamsOnlyForModeratorCmdMsgBody(webcamsOnlyForModerator: Boolean, setBy: String)

/**
 * Sent by user to get the value of webcamsOnlyForModerator mark.
 */
object GetWebcamsOnlyForModeratorReqMsg { val NAME = "GetWebcamsOnlyForModeratorReqMsg" }
case class GetWebcamsOnlyForModeratorReqMsg(header: BbbClientMsgHeader, body: GetWebcamsOnlyForModeratorReqMsgBody) extends StandardMsg
case class GetWebcamsOnlyForModeratorReqMsgBody(requestedBy: String)

/**
 * Sent to user as response to get webcamsOnlyForModerator mark.
 */
object GetWebcamsOnlyForModeratorRespMsg { val NAME = "GetWebcamsOnlyForModeratorRespMsg" }
case class GetWebcamsOnlyForModeratorRespMsg(header: BbbClientMsgHeader, body: GetWebcamsOnlyForModeratorRespMsgBody) extends BbbCoreMsg
case class GetWebcamsOnlyForModeratorRespMsgBody(webcamsOnlyForModerator: Boolean, requestedBy: String)

/**
 * Sent to all users about webcam only for moderator value.
 */
object WebcamsOnlyForModeratorChangedEvtMsg { val NAME = "WebcamsOnlyForModeratorChangedEvtMsg" }
case class WebcamsOnlyForModeratorChangedEvtMsg(header: BbbClientMsgHeader, body: WebcamsOnlyForModeratorChangedEvtMsgBody) extends BbbCoreMsg
case class WebcamsOnlyForModeratorChangedEvtMsgBody(webcamsOnlyForModerator: Boolean, setBy: String)

/**
 * Sent by user to get status of screenshare (meant for late joiners).
 */
object GetScreenshareStatusReqMsg { val NAME = "GetScreenshareStatusReqMsg" }
case class GetScreenshareStatusReqMsg(header: BbbClientMsgHeader, body: GetScreenshareStatusReqMsgBody) extends StandardMsg
case class GetScreenshareStatusReqMsgBody(requestedBy: String)

/**
 * Sent from client about a user changing RaiseHand.
 */
object ChangeUserRaiseHandReqMsg { val NAME = "ChangeUserRaiseHandReqMsg" }
case class ChangeUserRaiseHandReqMsg(header: BbbClientMsgHeader, body: ChangeUserRaiseHandReqMsgBody) extends StandardMsg
case class ChangeUserRaiseHandReqMsgBody(userId: String, raiseHand: Boolean)

/**
 * Sent to all clients about a user changing RaiseHand.
 */
object UserRaiseHandChangedEvtMsg { val NAME = "UserRaiseHandChangedEvtMsg" }
case class UserRaiseHandChangedEvtMsg(header: BbbClientMsgHeader, body: UserRaiseHandChangedEvtMsgBody) extends BbbCoreMsg
case class UserRaiseHandChangedEvtMsgBody(userId: String, raiseHand: Boolean)

/**
 * Sent from client about a user changing Away.
 */
object ChangeUserAwayReqMsg { val NAME = "ChangeUserAwayReqMsg" }
case class ChangeUserAwayReqMsg(header: BbbClientMsgHeader, body: ChangeUserAwayReqMsgBody) extends StandardMsg
case class ChangeUserAwayReqMsgBody(userId: String, away: Boolean)

/**
 * Sent to all clients about a user changing Away.
 */
object UserAwayChangedEvtMsg { val NAME = "UserAwayChangedEvtMsg" }
case class UserAwayChangedEvtMsg(header: BbbClientMsgHeader, body: UserAwayChangedEvtMsgBody) extends BbbCoreMsg
case class UserAwayChangedEvtMsgBody(userId: String, away: Boolean)

/**
 * Sent from client about a user changing ReactionEmoji.
 */
object ChangeUserReactionEmojiReqMsg { val NAME = "ChangeUserReactionEmojiReqMsg" }
case class ChangeUserReactionEmojiReqMsg(header: BbbClientMsgHeader, body: ChangeUserReactionEmojiReqMsgBody) extends StandardMsg
case class ChangeUserReactionEmojiReqMsgBody(userId: String, reactionEmoji: String)

/**
 * Sent to all clients about a user changing ReactionEmoji.
 */
object UserReactionEmojiChangedEvtMsg { val NAME = "UserReactionEmojiChangedEvtMsg" }
case class UserReactionEmojiChangedEvtMsg(header: BbbClientMsgHeader, body: UserReactionEmojiChangedEvtMsgBody) extends BbbCoreMsg
case class UserReactionEmojiChangedEvtMsgBody(userId: String, reactionEmoji: String)

/**
 * Sent from client about a mod clearing all users' Reaction.
 */
object ClearAllUsersReactionCmdMsg { val NAME = "ClearAllUsersReactionCmdMsg" }
case class ClearAllUsersReactionCmdMsg(header: BbbClientMsgHeader, body: ClearAllUsersReactionCmdMsgBody) extends StandardMsg
case class ClearAllUsersReactionCmdMsgBody(userId: String)

/**
 * Sent to all clients about clearing all users' Reaction.
 */
object ClearedAllUsersReactionEvtMsg { val NAME = "ClearedAllUsersReactionEvtMsg" }
case class ClearedAllUsersReactionEvtMsg(header: BbbClientMsgHeader, body: ClearedAllUsersReactionEvtMsgBody) extends StandardMsg
case class ClearedAllUsersReactionEvtMsgBody()

/**
 * Sent from client to inform the connection is alive.
 */
object UserConnectionAliveReqMsg { val NAME = "UserConnectionAliveReqMsg" }
case class UserConnectionAliveReqMsg(header: BbbClientMsgHeader, body: UserConnectionAliveReqMsgBody) extends StandardMsg
case class UserConnectionAliveReqMsgBody(userId: String, networkRttInMs: Double, traceLog: String)

/**
 * Sent from client to update clientSettings.
 */
object SetUserClientSettingsReqMsg { val NAME = "SetUserClientSettingsReqMsg" }
case class SetUserClientSettingsReqMsg(header: BbbClientMsgHeader, body: SetUserClientSettingsReqMsgBody) extends StandardMsg
case class SetUserClientSettingsReqMsgBody(userClientSettingsJson: Map[String, Any])

/**
 * Sent from client to inform the echo test is running.
 */
object SetUserEchoTestRunningReqMsg { val NAME = "SetUserEchoTestRunningReqMsg" }
case class SetUserEchoTestRunningReqMsg(header: BbbClientMsgHeader, body: SetUserEchoTestRunningReqMsgBody) extends StandardMsg
case class SetUserEchoTestRunningReqMsgBody()

/**
 * Sent to all clients about a user mobile flag.
 */
object UserMobileFlagChangedEvtMsg { val NAME = "UserMobileFlagChangedEvtMsg" }
case class UserMobileFlagChangedEvtMsg(header: BbbClientMsgHeader, body: UserMobileFlagChangedEvtMsgBody) extends BbbCoreMsg
case class UserMobileFlagChangedEvtMsgBody(userId: String, mobile: Boolean)

object AssignPresenterReqMsg { val NAME = "AssignPresenterReqMsg" }
case class AssignPresenterReqMsg(header: BbbClientMsgHeader, body: AssignPresenterReqMsgBody) extends StandardMsg
case class AssignPresenterReqMsgBody(assignedBy: String, newPresenterId: String)

/**
 * Sent from client to change the video pin of the user in the meeting.
 */
object ChangeUserPinStateReqMsg { val NAME = "ChangeUserPinStateReqMsg" }
case class ChangeUserPinStateReqMsg(header: BbbClientMsgHeader, body: ChangeUserPinStateReqMsgBody) extends StandardMsg
case class ChangeUserPinStateReqMsgBody(userId: String, pin: Boolean, changedBy: String)

object UserPinStateChangedEvtMsg { val NAME = "UserPinStateChangedEvtMsg" }
case class UserPinStateChangedEvtMsg(header: BbbClientMsgHeader, body: UserPinStateChangedEvtMsgBody) extends BbbCoreMsg
case class UserPinStateChangedEvtMsgBody(userId: String, pin: Boolean, changedBy: String)
/**
 * Sent from client to change the role of the user in the meeting.
 */
object ChangeUserRoleCmdMsg { val NAME = "ChangeUserRoleCmdMsg" }
case class ChangeUserRoleCmdMsg(header: BbbClientMsgHeader, body: ChangeUserRoleCmdMsgBody) extends StandardMsg
case class ChangeUserRoleCmdMsgBody(userId: String, role: String, changedBy: String)

object UserRoleChangedEvtMsg { val NAME = "UserRoleChangedEvtMsg" }
case class UserRoleChangedEvtMsg(header: BbbClientMsgHeader, body: UserRoleChangedEvtMsgBody) extends BbbCoreMsg
case class UserRoleChangedEvtMsgBody(userId: String, role: String, changedBy: String)

/**
 * Sent from client to eject the user from the meeting.
 */
object EjectUserFromMeetingCmdMsg { val NAME = "EjectUserFromMeetingCmdMsg" }
case class EjectUserFromMeetingCmdMsg(header: BbbClientMsgHeader, body: EjectUserFromMeetingCmdMsgBody) extends StandardMsg
case class EjectUserFromMeetingCmdMsgBody(userId: String, ejectedBy: String, banUser: Boolean)

/**
 * Sent from client to lock user in meeting.
 */
object LockUserInMeetingCmdMsg { val NAME = "LockUserInMeetingCmdMsg" }
case class LockUserInMeetingCmdMsg(header: BbbClientMsgHeader, body: LockUserInMeetingCmdMsgBody) extends StandardMsg
case class LockUserInMeetingCmdMsgBody(userId: String, lock: Boolean, lockedBy: String)

/**
 * Send to client that user has been locked.
 */
object UserLockedInMeetingEvtMsg { val NAME = "UserLockedInMeetingEvtMsg" }
case class UserLockedInMeetingEvtMsg(header: BbbClientMsgHeader, body: UserLockedInMeetingEvtMsgBody) extends BbbCoreMsg
case class UserLockedInMeetingEvtMsgBody(userId: String, locked: Boolean, lockedBy: String)

/**
 * Sent by client to lock users.
 */
object LockUsersInMeetingCmdMsg { val NAME = "LockUsersInMeetingCmdMsg" }
case class LockUsersInMeetingCmdMsg(header: BbbClientMsgHeader, body: LockUsersInMeetingCmdMsgBody) extends StandardMsg
case class LockUsersInMeetingCmdMsgBody(lock: Boolean, lockedBy: String, except: Vector[String])

/**
 * Sent by client to set user lock setting.
 */
object ChangeUserLockSettingsInMeetingCmdMsg { val NAME = "ChangeUserLockSettingsInMeetingCmdMsg" }
case class ChangeUserLockSettingsInMeetingCmdMsg(
    header: BbbClientMsgHeader,
    body:   ChangeUserLockSettingsInMeetingCmdMsgBody
) extends StandardMsg
case class ChangeUserLockSettingsInMeetingCmdMsgBody(userId: String, disablePubChat: Boolean, setBy: String)

object UserLockSettingsInMeetingChangedEvtMsg { val NAME = "UserLockSettingsInMeetingChangedEvtMsg" }
case class UserLockSettingsInMeetingChangedEvtMsg(
    header: BbbClientMsgHeader,
    body:   UserLockSettingsInMeetingChangedEvtMsgBody
) extends BbbCoreMsg
case class UserLockSettingsInMeetingChangedEvtMsgBody(userId: String, disablePubChat: Boolean, setBy: String)

/**
 * Sent by client to set lock setting.
 */
object ChangeLockSettingsInMeetingCmdMsg { val NAME = "ChangeLockSettingsInMeetingCmdMsg" }
case class ChangeLockSettingsInMeetingCmdMsg(
    header: BbbClientMsgHeader,
    body:   ChangeLockSettingsInMeetingCmdMsgBody
) extends StandardMsg
case class ChangeLockSettingsInMeetingCmdMsgBody(disableCam: Boolean, disableMic: Boolean, disablePrivChat: Boolean,
                                                 disablePubChat: Boolean, disableNotes: Boolean, hideUserList: Boolean, lockOnJoin: Boolean,
                                                 lockOnJoinConfigurable: Boolean, hideViewersCursor: Boolean, hideViewersAnnotation: Boolean, setBy: String)

object LockSettingsInMeetingChangedEvtMsg { val NAME = "LockSettingsInMeetingChangedEvtMsg" }
case class LockSettingsInMeetingChangedEvtMsg(
    header: BbbClientMsgHeader,
    body:   LockSettingsInMeetingChangedEvtMsgBody
) extends BbbCoreMsg
case class LockSettingsInMeetingChangedEvtMsgBody(disableCam: Boolean, disableMic: Boolean, disablePrivChat: Boolean,
                                                  disablePubChat: Boolean, disableNotes: Boolean, hideUserList: Boolean, lockOnJoin: Boolean,
                                                  lockOnJoinConfigurable: Boolean, hideViewersCursor: Boolean, hideViewersAnnotation: Boolean, setBy: String)

/**
 * Response to the query for lock settings.
 */
object GetLockSettingsRespMsg { val NAME = "GetLockSettingsRespMsg" }
case class GetLockSettingsRespMsg(header: BbbClientMsgHeader, body: GetLockSettingsRespMsgBody) extends BbbCoreMsg
case class GetLockSettingsRespMsgBody(disableCam: Boolean, disableMic: Boolean, disablePrivChat: Boolean,
                                      disablePubChat: Boolean, disableNotes: Boolean, hideUserList: Boolean, lockOnJoin: Boolean,
                                      lockOnJoinConfigurable: Boolean, hideViewersCursor: Boolean, hideViewersAnnotation: Boolean)

object LockSettingsNotInitializedRespMsg { val NAME = "LockSettingsNotInitializedRespMsg" }
case class LockSettingsNotInitializedRespMsg(header: BbbClientMsgHeader, body: LockSettingsNotInitializedRespMsgBody) extends BbbCoreMsg
case class LockSettingsNotInitializedRespMsgBody(userId: String)

/**
 * Sent from client to logout and end meeting.
 */
object LogoutAndEndMeetingCmdMsg { val NAME = "LogoutAndEndMeetingCmdMsg" }
case class LogoutAndEndMeetingCmdMsg(header: BbbClientMsgHeader, body: LogoutAndEndMeetingCmdMsgBody) extends StandardMsg
case class LogoutAndEndMeetingCmdMsgBody(userId: String)

object UserJoinMeetingReqMsg { val NAME = "UserJoinMeetingReqMsg" }
case class UserJoinMeetingReqMsg(header: BbbClientMsgHeader, body: UserJoinMeetingReqMsgBody) extends StandardMsg
case class UserJoinMeetingReqMsgBody(userId: String, authToken: String, clientType: String, clientIsMobile: Boolean)

/**
 * Sent from client to bbb-akka to notify that a user is leaving
 */
object UserLeaveReqMsg { val NAME = "UserLeaveReqMsg" }
case class UserLeaveReqMsg(header: BbbClientMsgHeader, body: UserLeaveReqMsgBody) extends StandardMsg
case class UserLeaveReqMsgBody(userId: String, sessionId: String, loggedOut: Boolean)

/**
 * Sent from client to add user to the presenter group of a meeting.
 */
object AddUserToPresenterGroupCmdMsg { val NAME = "AddUserToPresenterGroupCmdMsg" }
case class AddUserToPresenterGroupCmdMsg(header: BbbClientMsgHeader, body: AddUserToPresenterGroupCmdMsgBody) extends StandardMsg
case class AddUserToPresenterGroupCmdMsgBody(userId: String, requesterId: String)

/**
 * Sent to all clients about a user added to the presenter group of a meeting
 */
object UserAddedToPresenterGroupEvtMsg { val NAME = "UserAddedToPresenterGroupEvtMsg" }
case class UserAddedToPresenterGroupEvtMsg(header: BbbClientMsgHeader, body: UserAddedToPresenterGroupEvtMsgBody) extends StandardMsg
case class UserAddedToPresenterGroupEvtMsgBody(userId: String, requesterId: String)

/**
 * Sent from client to remove user from the presenter group of a meeting.
 */
object RemoveUserFromPresenterGroupCmdMsg { val NAME = "RemoveUserFromPresenterGroupCmdMsg" }
case class RemoveUserFromPresenterGroupCmdMsg(header: BbbClientMsgHeader, body: RemoveUserFromPresenterGroupCmdMsgBody) extends StandardMsg
case class RemoveUserFromPresenterGroupCmdMsgBody(userId: String, requesterId: String)

/**
 * Sent to all clients about a user removed from the presenter group of a meeting
 */
object UserRemovedFromPresenterGroupEvtMsg { val NAME = "UserRemovedFromPresenterGroupEvtMsg" }
case class UserRemovedFromPresenterGroupEvtMsg(header: BbbClientMsgHeader, body: UserRemovedFromPresenterGroupEvtMsgBody) extends StandardMsg
case class UserRemovedFromPresenterGroupEvtMsgBody(userId: String, requesterId: String)

/**
 * Sent from client to request the presenter group of a meeting.
 */
object GetPresenterGroupReqMsg { val NAME = "GetPresenterGroupReqMsg" }
case class GetPresenterGroupReqMsg(header: BbbClientMsgHeader, body: GetPresenterGroupReqMsgBody) extends StandardMsg
case class GetPresenterGroupReqMsgBody(requesterId: String)

/**
 * Sent to all clients about the members of the presenter group of a meeting
 */
object GetPresenterGroupRespMsg { val NAME = "GetPresenterGroupRespMsg" }
case class GetPresenterGroupRespMsg(header: BbbClientMsgHeader, body: GetPresenterGroupRespMsgBody) extends StandardMsg
case class GetPresenterGroupRespMsgBody(presenterGroup: Vector[String], requesterId: String)

object UserInactivityInspectMsg { val NAME = "UserInactivityInspectMsg" }
case class UserInactivityInspectMsg(header: BbbClientMsgHeader, body: UserInactivityInspectMsgBody) extends StandardMsg
case class UserInactivityInspectMsgBody(meetingId: String, responseDelay: Long)

object UserActivitySignCmdMsg { val NAME = "UserActivitySignCmdMsg" }
case class UserActivitySignCmdMsg(header: BbbClientMsgHeader, body: UserActivitySignCmdMsgBody) extends StandardMsg
case class UserActivitySignCmdMsgBody(userId: String)

object SetUserSpeechLocaleReqMsg { val NAME = "SetUserSpeechLocaleReqMsg" }
case class SetUserSpeechLocaleReqMsg(header: BbbClientMsgHeader, body: SetUserSpeechLocaleReqMsgBody) extends StandardMsg
case class SetUserSpeechLocaleReqMsgBody(locale: String, provider: String)

object UserSpeechLocaleChangedEvtMsg { val NAME = "UserSpeechLocaleChangedEvtMsg" }
case class UserSpeechLocaleChangedEvtMsg(header: BbbClientMsgHeader, body: UserSpeechLocaleChangedEvtMsgBody) extends BbbCoreMsg
case class UserSpeechLocaleChangedEvtMsgBody(locale: String, provider: String)

object SetUserCaptionLocaleReqMsg { val NAME = "SetUserCaptionLocaleReqMsg" }
case class SetUserCaptionLocaleReqMsg(header: BbbClientMsgHeader, body: SetUserCaptionLocaleReqMsgBody) extends StandardMsg
case class SetUserCaptionLocaleReqMsgBody(locale: String, provider: String)

object UserCaptionLocaleChangedEvtMsg { val NAME = "UserCaptionLocaleChangedEvtMsg" }
case class UserCaptionLocaleChangedEvtMsg(header: BbbClientMsgHeader, body: UserCaptionLocaleChangedEvtMsgBody) extends BbbCoreMsg
case class UserCaptionLocaleChangedEvtMsgBody(locale: String, provider: String)

object SetUserSpeechOptionsReqMsg { val NAME = "SetUserSpeechOptionsReqMsg" }
case class SetUserSpeechOptionsReqMsg(header: BbbClientMsgHeader, body: SetUserSpeechOptionsReqMsgBody) extends StandardMsg
case class SetUserSpeechOptionsReqMsgBody(partialUtterances: Boolean, minUtteranceLength: Int)

object UserSpeechOptionsChangedEvtMsg { val NAME = "UserSpeechOptionsChangedEvtMsg" }
case class UserSpeechOptionsChangedEvtMsg(header: BbbClientMsgHeader, body: UserSpeechOptionsChangedEvtMsgBody) extends BbbCoreMsg
case class UserSpeechOptionsChangedEvtMsgBody(partialUtterances: Boolean, minUtteranceLength: Int)
