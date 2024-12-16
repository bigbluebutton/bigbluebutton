package org.bigbluebutton.common2.msgs

import java.util

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
case class BreakoutRoomsListEvtMsgBody(meetingId: String, rooms: Vector[BreakoutRoomInfo], roomsReady: Boolean, sendInviteToModerators: Boolean)
case class BreakoutRoomInfo(name: String, externalId: String, breakoutId: String, sequence: Int, shortName: String, isDefaultName: Boolean, freeJoin: Boolean, html5JoinUrls: Map[String, String], captureNotes: Boolean, captureSlides: Boolean)

object BreakoutRoomsListMsg { val NAME = "BreakoutRoomsListMsg" }
case class BreakoutRoomsListMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListMsgBody) extends StandardMsg
case class BreakoutRoomsListMsgBody(meetingId: String)

/**
 * Sent to client that breakout rooms have been created.
 */
object BreakoutRoomStartedEvtMsg { val NAME = "BreakoutRoomStartedEvtMsg" }
case class BreakoutRoomStartedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomStartedEvtMsgBody) extends BbbCoreMsg
case class BreakoutRoomStartedEvtMsgBody(parentMeetingId: String, breakout: BreakoutRoomInfo)

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
    shortName:               String,
    isDefaultName:           Boolean,
    freeJoin:                Boolean,
    dialNumber:              String,
    voiceConfId:             String,
    durationInMinutes:       Int,
    moderatorPassword:       String,
    viewerPassword:          String,
    sourcePresentationId:    String,
    sourcePresentationSlide: Int,
    record:                  Boolean,
    privateChatEnabled:      Boolean,
    captureNotes:            Boolean,
    captureSlides:           Boolean,
    captureNotesFilename:    String,
    captureSlidesFilename:   String,
    pluginProp:              util.Map[String, AnyRef],
)

/**
 * Sent by client to request to create breakout rooms.
 */
object CreateBreakoutRoomsCmdMsg { val NAME = "CreateBreakoutRoomsCmdMsg" }
case class CreateBreakoutRoomsCmdMsg(header: BbbClientMsgHeader, body: CreateBreakoutRoomsCmdMsgBody) extends StandardMsg
case class CreateBreakoutRoomsCmdMsgBody(meetingId: String, durationInMinutes: Int, record: Boolean, captureNotes: Boolean, captureSlides: Boolean, rooms: Vector[BreakoutRoomMsgBody], sendInviteToModerators: Boolean)
case class BreakoutRoomMsgBody(name: String, sequence: Int, shortName: String, captureNotesFilename: String, captureSlidesFilename: String, isDefaultName: Boolean, freeJoin: Boolean, users: Vector[String], allPages: Boolean, presId: String)

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

object SetBreakoutRoomInviteDismissedReqMsg { val NAME = "SetBreakoutRoomInviteDismissedReqMsg" }
case class SetBreakoutRoomInviteDismissedReqMsg(header: BbbClientMsgHeader, body: SetBreakoutRoomInviteDismissedReqMsgBody) extends StandardMsg
case class SetBreakoutRoomInviteDismissedReqMsgBody()

object TransferUserToMeetingEvtMsg { val NAME = "TransferUserToMeetingEvtMsg" }
case class TransferUserToMeetingEvtMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingEvtMsgBody) extends BbbCoreMsg
case class TransferUserToMeetingEvtMsgBody(fromVoiceConf: String, toVoiceConf: String, userId: String)

// Sent by user actor to ask for voice conference transfer
object TransferUserToMeetingRequestMsg { val NAME = "TransferUserToMeetingRequestMsg" }
case class TransferUserToMeetingRequestMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingRequestMsgBody) extends StandardMsg
case class TransferUserToMeetingRequestMsgBody(fromMeetingId: String, toMeetingId: String, userId: String)

object UpdateBreakoutRoomsTimeReqMsg { val NAME = "UpdateBreakoutRoomsTimeReqMsg" }
case class UpdateBreakoutRoomsTimeReqMsg(header: BbbClientMsgHeader, body: UpdateBreakoutRoomsTimeReqMsgBody) extends StandardMsg
case class UpdateBreakoutRoomsTimeReqMsgBody(meetingId: String, timeInMinutes: Int)

object UpdateBreakoutRoomsTimeEvtMsg { val NAME = "UpdateBreakoutRoomsTimeEvtMsg" }
case class UpdateBreakoutRoomsTimeEvtMsg(header: BbbClientMsgHeader, body: UpdateBreakoutRoomsTimeEvtMsgBody) extends BbbCoreMsg
case class UpdateBreakoutRoomsTimeEvtMsgBody(meetingId: String, timeInMinutes: Int)

object SendMessageToAllBreakoutRoomsReqMsg { val NAME = "SendMessageToAllBreakoutRoomsReqMsg" }
case class SendMessageToAllBreakoutRoomsReqMsg(header: BbbClientMsgHeader, body: SendMessageToAllBreakoutRoomsReqMsgBody) extends StandardMsg
case class SendMessageToAllBreakoutRoomsReqMsgBody(meetingId: String, msg: String)

object SendMessageToAllBreakoutRoomsEvtMsg { val NAME = "SendMessageToAllBreakoutRoomsEvtMsg" }
case class SendMessageToAllBreakoutRoomsEvtMsg(header: BbbClientMsgHeader, body: SendMessageToAllBreakoutRoomsEvtMsgBody) extends BbbCoreMsg
case class SendMessageToAllBreakoutRoomsEvtMsgBody(meetingId: String, senderId: String, msg: String, totalOfRooms: Int)

object ChangeUserBreakoutReqMsg { val NAME = "ChangeUserBreakoutReqMsg" }
case class ChangeUserBreakoutReqMsg(header: BbbClientMsgHeader, body: ChangeUserBreakoutReqMsgBody) extends StandardMsg
case class ChangeUserBreakoutReqMsgBody(meetingId: String, userId: String, fromBreakoutId: String, toBreakoutId: String)

object ChangeUserBreakoutEvtMsg { val NAME = "ChangeUserBreakoutEvtMsg" }
case class ChangeUserBreakoutEvtMsg(header: BbbClientMsgHeader, body: ChangeUserBreakoutEvtMsgBody) extends BbbCoreMsg
case class ChangeUserBreakoutEvtMsgBody(meetingId: String, userId: String, fromBreakoutId: String, toBreakoutId: String, redirectToHtml5JoinURL: String)

// Common Value objects
case class BreakoutUserVO(id: String, name: String)

case class BreakoutRoomVO(id: String, externalId: String, name: String, parentId: String,
                          sequence: Int, freeJoin: Boolean, voiceConf: String,
                          assignedUsers: Vector[String], users: Vector[BreakoutUserVO], captureNotes: Boolean, captureSlides: Boolean)

