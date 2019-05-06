package org.bigbluebutton.common2.msgs

object BreakoutRoomEndedEvtMsg { val NAME = "BreakoutRoomEndedEvtMsg" }
case class BreakoutRoomEndedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomEndedEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomEndedEvtMsgBody(parentId: String, breakoutId: String)

object BreakoutRoomJoinURLEvtMsg { val NAME = "BreakoutRoomJoinURLEvtMsg" }
case class BreakoutRoomJoinURLEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomJoinURLEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomJoinURLEvtMsgBody(parentId: String, breakoutId: String, externalId: String,
                                         userId: String, redirectJoinURL: String, redirectToHtml5JoinURL: String)

// Outgoing messages
object BreakoutRoomsListEvtMsg { val NAME = "BreakoutRoomsListEvtMsg" }
case class BreakoutRoomsListEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomsListEvtMsgBody(meetingId: String, rooms: Vector[BreakoutRoomInfo], roomsReady: Boolean)
case class BreakoutRoomInfo(name: String, externalId: String, breakoutId: String, sequence: Int, freeJoin: Boolean)

object BreakoutRoomsListMsg { val NAME = "BreakoutRoomsListMsg" }
case class BreakoutRoomsListMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListMsgBody) extends StandardMsg
case class BreakoutRoomsListMsgBody(meetingId: String)

/**
 * Sent to client that breakout rooms have been created.
 */
object BreakoutRoomStartedEvtMsg { val NAME = "BreakoutRoomStartedEvtMsg" }
case class BreakoutRoomStartedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomStartedEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomStartedEvtMsgBody(parentMeetingId: String, breakout: BreakoutRoomInfo)

object BreakoutRoomsTimeRemainingUpdateEvtMsg { val NAME = "BreakoutRoomsTimeRemainingUpdateEvtMsg" }
case class BreakoutRoomsTimeRemainingUpdateEvtMsg(
    header: BbbClientMsgHeader,
    body:   BreakoutRoomsTimeRemainingUpdateEvtMsgBody
) extends BbbCoreMsg
case class BreakoutRoomsTimeRemainingUpdateEvtMsgBody(timeRemaining: Long)

/**
 * Sent to bbb-web to create breakout rooms.
 */
object CreateBreakoutRoomSysCmdMsg { val NAME = "CreateBreakoutRoomSysCmdMsg" }
case class CreateBreakoutRoomSysCmdMsg(
    header: BbbCoreBaseHeader,
    body:   CreateBreakoutRoomSysCmdMsgBody
) extends BbbCoreMsg
case class CreateBreakoutRoomSysCmdMsgBody(meetingId: String, room: BreakoutRoomDetail)
case class BreakoutRoomDetail(
    breakoutMeetingId:       String,
    name:                    String,
    parentId:                String,
    sequence:                Integer,
    freeJoin:                Boolean,
    dialNumber:              String,
    voiceConfId:             String,
    durationInMinutes:       Int,
    moderatorPassword:       String,
    viewerPassword:          String,
    sourcePresentationId:    String,
    sourcePresentationSlide: Int,
    record:                  Boolean,
    privateChatEnabled:      Boolean
)

/**
 * Sent by client to request to create breakout rooms.
 */
object CreateBreakoutRoomsCmdMsg { val NAME = "CreateBreakoutRoomsCmdMsg" }
case class CreateBreakoutRoomsCmdMsg(header: BbbClientMsgHeader, body: CreateBreakoutRoomsCmdMsgBody) extends StandardMsg
case class CreateBreakoutRoomsCmdMsgBody(meetingId: String, durationInMinutes: Int, record: Boolean, rooms: Vector[BreakoutRoomMsgBody])
case class BreakoutRoomMsgBody(name: String, sequence: Int, freeJoin: Boolean, users: Vector[String])

// Sent by user to request ending all the breakout rooms
object EndAllBreakoutRoomsMsg { val NAME = "EndAllBreakoutRoomsMsg" }
case class EndAllBreakoutRoomsMsg(header: BbbClientMsgHeader, body: EndAllBreakoutRoomsMsgBody) extends StandardMsg
case class EndAllBreakoutRoomsMsgBody(meetingId: String)

/**
 * Sent by client to request a join URL for the breakout room.
 */
object RequestBreakoutJoinURLReqMsg { val NAME = "RequestBreakoutJoinURLReqMsg" }
case class RequestBreakoutJoinURLReqMsg(header: BbbClientMsgHeader, body: RequestBreakoutJoinURLReqMsgBody) extends StandardMsg
case class RequestBreakoutJoinURLReqMsgBody(meetingId: String, breakoutId: String, userId: String)

/**
 * Response sent to client for a join url for a user.
 */
object RequestBreakoutJoinURLRespMsg { val NAME = "RequestBreakoutJoinURLRespMsg" }
case class RequestBreakoutJoinURLRespMsg(header: BbbClientMsgHeader, body: RequestBreakoutJoinURLRespMsgBody) extends BbbCoreMsg
case class RequestBreakoutJoinURLRespMsgBody(parentId: String, breakoutId: String,
                                             userId: String, redirectJoinURL: String, redirectToHtml5JoinURL: String)

object TransferUserToMeetingEvtMsg { val NAME = "TransferUserToMeetingEvtMsg" }
case class TransferUserToMeetingEvtMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingEvtMsgBody) extends BbbCoreMsg
case class TransferUserToMeetingEvtMsgBody(fromVoiceConf: String, toVoiceConf: String, userId: String)

// Sent by user actor to ask for voice conference transfer
object TransferUserToMeetingRequestMsg { val NAME = "TransferUserToMeetingRequestMsg" }
case class TransferUserToMeetingRequestMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingRequestMsgBody) extends StandardMsg
case class TransferUserToMeetingRequestMsgBody(fromMeetingId: String, toMeetingId: String, userId: String)

object UpdateBreakoutUsersEvtMsg { val NAME = "UpdateBreakoutUsersEvtMsg" }
case class UpdateBreakoutUsersEvtMsg(header: BbbClientMsgHeader, body: UpdateBreakoutUsersEvtMsgBody) extends BbbCoreMsg
case class UpdateBreakoutUsersEvtMsgBody(parentId: String, breakoutId: String, users: Vector[BreakoutUserVO])

// Common Value objects
case class BreakoutUserVO(id: String, name: String)

case class BreakoutRoomVO(id: String, externalId: String, name: String, parentId: String,
                          sequence: Int, freeJoin: Boolean, voiceConf: String,
                          assignedUsers: Vector[String], users: Vector[BreakoutUserVO])

