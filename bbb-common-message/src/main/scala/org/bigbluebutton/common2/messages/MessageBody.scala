package org.bigbluebutton.common2.messages

import org.bigbluebutton.common2.domain.DefaultProps

object MessageBody {
  case class CreateMeetingReqMsgBody(props: DefaultProps)
  case class MeetingCreatedEvtBody(props: DefaultProps)
  case class ValidateAuthTokenReqMsgBody(userId: String, authToken: String)
  case class RegisterUserReqMsgBody(meetingId: String, intUserId: String, name: String, role: String,
                                    extUserId: String, authToken: String, avatarURL: String,
                                    guest: Boolean, authed: Boolean)
  case class ValidateAuthTokenRespMsgBody(userId: String, authToken: String, valid: Boolean)
  case class UserJoinReqMsgBody(userId: String, authToken: String)
  case class UserLeaveReqMsgBody(userId: String, sessionId: String)
  case class GetUsersReqMsgBody(requesterId: String)
  case class UserEmojiStatusChangeReqMsgBody(userId: String, emoji: String)
  case class EjectUserFromMeetingReqMsgBody(userId: String, requesterId: String)
  case class UserBroadcastCamStartMsgBody(stream: String)
  case class UserBroadcastCamStopMsgBody(stream: String)
  case class ChangeUserStatusReqMsgBody(userId: String, status: String, value: String)
  case class ChangeUserRoleReqMsgBody(userId: String, role: String)
  case class AssignPresenterReqMsgBody(userId: String, requesterId: String)
  case class SetRecordingReqMsgBody(recording: Boolean, requesterId: String)
  case class GetRecordingStatusReqMsgBody(requesterId: String)
  case class AllowUserToShareDesktopReqMsgBody(userId: String)

  case class UserBroadcastCamStartedEvtMsgBody(userId: String, stream: String)
  case class UserBroadcastCamStoppedEvtMsgBody(userId: String, stream: String)

  // Incomings message
  case class BreakoutRoomsListMsgBody(meetingId: String)
  case class CreateBreakoutRoomsMsgBody(meetingId: String, durationInMinutes: Int, record: Boolean, rooms: Vector[BreakoutRoomMsgBody])
  case class BreakoutRoomMsgBody(name: String, sequence: Int, users: Vector[String])
  case class RequestBreakoutJoinURLMsgBody(meetingId: String, breakoutMeetingId: String, userId: String)
  case class BreakoutRoomCreatedMsgBody(meetingId: String, breakoutRoomId: String)
  case class BreakoutRoomUsersUpdateMsgBody(meetingId: String, breakoutMeetingId: String, users: Vector[BreakoutUserVO])
  case class SendBreakoutUsersUpdateMsgBody(meetingId: String)
  case class EndAllBreakoutRoomsMsgBody(meetingId: String)
  case class BreakoutRoomEndedMsgBody(meetingId: String, breakoutRoomId: String)
  case class TransferUserToMeetingRequestMsgBody(meetingId: String, targetMeetingId: String, userId: String)
  case class BreakoutUserVO(id: String, name: String)
  case class BreakoutRoomVO(id: String, externalMeetingId: String, name: String, parentRoomId: String, sequence: Integer, voiceConfId: String,
                            assignedUsers: Vector[String], users: Vector[BreakoutUserVO])

  // Outgoing event messages
  case class BreakoutRoomsListEvtMsgBody(meetingId: String, rooms: Vector[BreakoutRoomInfo], roomsReady: Boolean)
  case class BreakoutRoomInfo(name: String, externalMeetingId: String, meetingId: String, sequence: Int)
  case class CreateBreakoutRoomEvtMsgBody(meetingId: String, room: BreakoutRoomDetail)
  case class BreakoutRoomDetail(breakoutMeetingId: String, name: String, parentId: String, sequence: Integer,
                                voiceConfId: String, durationInMinutes: Int, moderatorPassword: String, viewerPassword: String,
                                sourcePresentationId: String, sourcePresentationSlide: Int, record: Boolean)
  case class EndBreakoutRoomEvtMsgBody(breakoutMeetingId: String)
  case class BreakoutRoomJoinURLEvtMsgBody(parentMeetingId: String, recorded: Boolean, breakoutMeetingId: String, userId: String, redirectJoinURL: String, noRedirectJoinURL: String)
  case class BreakoutRoomStartedEvtMsgBody(parentMeetingId: String, recorded: Boolean, breakout: BreakoutRoomInfo)
  case class UpdateBreakoutUsersEvtMsgBody(parentMeetingId: String, recorded: Boolean, breakoutMeetingId: String, users: Vector[BreakoutUserVO])
  case class MeetingTimeRemainingUpdateEvtMsgBody(meetingId: String, recorded: Boolean, timeRemaining: Int)
  case class BreakoutRoomsTimeRemainingUpdateEvtMsgBody(meetingId: String, recorded: Boolean, timeRemaining: Int)
  case class BreakoutRoomEndedEvtMsgBody(parentMeetingId: String, meetingId: String)
}
