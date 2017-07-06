package org.bigbluebutton.common2.msgs

  object BreakoutRoomCreatedMsg { val NAME = "BreakoutRoomCreatedMsg" }
  case class BreakoutRoomCreatedMsg(header: BbbClientMsgHeader, body: BreakoutRoomCreatedMsgBody) extends BbbCoreMsg
  case class BreakoutRoomCreatedMsgBody(meetingId: String, breakoutRoomId: String)

  object BreakoutRoomEndedEvtMsg { val NAME = "BreakoutRoomEndedEvtMsg" }
  case class BreakoutRoomEndedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomEndedEvtMsgBody) extends BbbCoreMsg
  case class BreakoutRoomEndedEvtMsgBody(parentMeetingId: String, meetingId: String)

  // Sent by breakout actor to tell meeting actor that breakout room has been ended
  object BreakoutRoomEndedMsg { val NAME = "BreakoutRoomEndedMsg" }
  case class BreakoutRoomEndedMsg(header: BbbClientMsgHeader, body: BreakoutRoomEndedMsgBody) extends BbbCoreMsg
  case class BreakoutRoomEndedMsgBody(meetingId: String, breakoutRoomId: String)

  object BreakoutRoomJoinURLEvtMsg { val NAME = "BreakoutRoomJoinURLEvtMsg" }
  case class BreakoutRoomJoinURLEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomJoinURLEvtMsgBody) extends BbbCoreMsg
  case class BreakoutRoomJoinURLEvtMsgBody(parentMeetingId: String, breakoutMeetingId: String,
                                           userId: String, redirectJoinURL: String, noRedirectJoinURL: String)

  // Outgoing messages
  object BreakoutRoomsListEvtMsg { val NAME = "BreakoutRoomsListEvtMsg" }
  case class BreakoutRoomsListEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListEvtMsgBody) extends BbbCoreMsg
  case class BreakoutRoomsListEvtMsgBody(meetingId: String, rooms: Vector[BreakoutRoomInfo], roomsReady: Boolean)
  case class BreakoutRoomInfo(name: String, externalMeetingId: String, meetingId: String, sequence: Int)

  object BreakoutRoomsListMsg { val NAME = "BreakoutRoomsListMsg" }
  case class BreakoutRoomsListMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListMsgBody) extends BbbCoreMsg
  case class BreakoutRoomsListMsgBody(meetingId: String)

/**
  * Sent to client that breakout rooms have been created.
  */
  object BreakoutRoomStartedEvtMsg { val NAME = "BreakoutRoomStartedEvtMsg" }
  case class BreakoutRoomStartedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomStartedEvtMsgBody) extends BbbCoreMsg
  case class BreakoutRoomStartedEvtMsgBody(parentMeetingId: String, breakout: BreakoutRoomInfo)

  object BreakoutRoomsTimeRemainingUpdateEvtMsg { val NAME = "BreakoutRoomsTimeRemainingUpdateEvtMsg" }
  case class BreakoutRoomsTimeRemainingUpdateEvtMsg(header: BbbClientMsgHeader,
                                                    body: BreakoutRoomsTimeRemainingUpdateEvtMsgBody) extends BbbCoreMsg
  case class BreakoutRoomsTimeRemainingUpdateEvtMsgBody(meetingId: String, timeRemaining: Int)


  // Sent by breakout actor to tell meeting actor the list of users in the breakout room.
  object BreakoutRoomUsersUpdateMsg { val NAME = "BreakoutRoomUsersUpdateMsg" }
  case class BreakoutRoomUsersUpdateMsg(header: BbbClientMsgHeader, body: BreakoutRoomUsersUpdateMsgBody) extends BbbCoreMsg
  case class BreakoutRoomUsersUpdateMsgBody(meetingId: String, breakoutMeetingId: String, users: Vector[BreakoutUserVO])

  object CreateBreakoutRoomSysCmdMsg { val NAME = "CreateBreakoutRoomSysCmdMsg" }
  case class CreateBreakoutRoomSysCmdMsg(header: BbbCoreBaseHeader,
                                      body: CreateBreakoutRoomSysCmdMsgBody) extends BbbCoreMsg
  case class CreateBreakoutRoomSysCmdMsgBody(meetingId: String, room: BreakoutRoomDetail)
  case class BreakoutRoomDetail(breakoutMeetingId: String, name: String, parentId: String, sequence: Integer,
                                voiceConfId: String, durationInMinutes: Int, moderatorPassword: String, viewerPassword: String,
                                sourcePresentationId: String, sourcePresentationSlide: Int, record: Boolean)

  object CreateBreakoutRoomsCmdMsg { val NAME = "CreateBreakoutRoomsCmdMsg" }
  case class CreateBreakoutRoomsCmdMsg(header: BbbClientMsgHeader, body: CreateBreakoutRoomsCmdMsgBody) extends BbbCoreMsg
  case class CreateBreakoutRoomsCmdMsgBody(meetingId: String, durationInMinutes: Int, record: Boolean, rooms: Vector[BreakoutRoomMsgBody])
  case class BreakoutRoomMsgBody(name: String, sequence: Int, users: Vector[String])

  // Sent by user to request ending all the breakout rooms
  object EndAllBreakoutRoomsMsg { val NAME = "EndAllBreakoutRoomsMsg" }
  case class EndAllBreakoutRoomsMsg(header: BbbClientMsgHeader, body: EndAllBreakoutRoomsMsgBody) extends BbbCoreMsg
  case class EndAllBreakoutRoomsMsgBody(meetingId: String)

  object EndBreakoutRoomEvtMsg { val NAME = "EndBreakoutRoomEvtMsg" }
  case class EndBreakoutRoomEvtMsg(header: BbbClientMsgHeader, body: EndBreakoutRoomEvtMsgBody) extends BbbCoreMsg
  case class EndBreakoutRoomEvtMsgBody(breakoutMeetingId: String)

  object MeetingTimeRemainingUpdateEvtMsg { val NAME = "MeetingTimeRemainingUpdateEvtMsg" }
  case class MeetingTimeRemainingUpdateEvtMsg(header: BbbClientMsgHeader, body: MeetingTimeRemainingUpdateEvtMsgBody) extends BbbCoreMsg
  case class MeetingTimeRemainingUpdateEvtMsgBody(meetingId: String, timeRemaining: Int)

/**
  * Sent by client to request a join URL for the breakout room.
  */
  object RequestBreakoutJoinURLReqMsg { val NAME = "RequestBreakoutJoinURLReqMsg" }
  case class RequestBreakoutJoinURLReqMsg(header: BbbClientMsgHeader, body: RequestBreakoutJoinURLReqMsgBody) extends BbbCoreMsg
  case class RequestBreakoutJoinURLReqMsgBody(meetingId: String, breakoutMeetingId: String, userId: String)

/**
  * Response sent to client for a join url for a user.
  */
object RequestBreakoutJoinURLRespMsg { val NAME = "RequestBreakoutJoinURLRespMsg" }
case class RequestBreakoutJoinURLRespMsg(header: BbbClientMsgHeader, body: RequestBreakoutJoinURLRespMsgBody) extends BbbCoreMsg
case class RequestBreakoutJoinURLRespMsgBody(parentMeetingId: String, breakoutMeetingId: String,
                                             userId: String, redirectJoinURL: String, noRedirectJoinURL: String)

  // Send by internal actor to tell the breakout actor to send it's list of users to the main meeting actor.
  object SendBreakoutUsersUpdateMsg { val NAME = "SendBreakoutUsersUpdateMsg" }
  case class SendBreakoutUsersUpdateMsg(header: BbbClientMsgHeader, body: SendBreakoutUsersUpdateMsgBody) extends BbbCoreMsg
  case class SendBreakoutUsersUpdateMsgBody(meetingId: String)

  object TransferUserToMeetingEvtMsg { val NAME = "TransferUserToMeetingEvtMsg" }
  case class TransferUserToMeetingEvtMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingEvtMsgBody) extends BbbCoreMsg
  case class TransferUserToMeetingEvtMsgBody(voiceConfId: String, targetVoiceConfId: String, userId: String)

  // Sent by user actor to ask for voice conference transfer
  object TransferUserToMeetingRequestMsg { val NAME = "TransferUserToMeetingRequestMsg" }
  case class TransferUserToMeetingRequestMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingRequestMsgBody) extends BbbCoreMsg
  case class TransferUserToMeetingRequestMsgBody(meetingId: String, targetMeetingId: String, userId: String)

  object UpdateBreakoutUsersEvtMsg { val NAME = "UpdateBreakoutUsersEvtMsg" }
  case class UpdateBreakoutUsersEvtMsg(header: BbbClientMsgHeader, body: UpdateBreakoutUsersEvtMsgBody) extends BbbCoreMsg
  case class UpdateBreakoutUsersEvtMsgBody(parentMeetingId: String, breakoutMeetingId: String, users: Vector[BreakoutUserVO])

  // Common Value objects
  case class BreakoutUserVO(id: String, name: String)

  case class BreakoutRoomVO(id: String, externalMeetingId: String, name: String, parentRoomId: String, sequence: Integer, voiceConfId: String,
                            assignedUsers: Vector[String], users: Vector[BreakoutUserVO])




