package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.messages.MessageBody._

object MessageTypes {
  val DIRECT = "DIRECT"
  val BROADCAST_TO_MEETING = "BROADCAST_TO_MEETING" // Send to all clients in the meeting
  val BROADCAST_TO_ALL = "BROADCAST_TO_ALL" // Send to all clients
  val SYSTEM = "SYSTEM"
}

// seal trait to force all classes that extends this trait to be defined in this file.
trait BbbCoreMsg
sealed trait BbbCommonMsg
trait BbbCoreHeader

case class RoutingEnvelope(msgType: String, meetingId: String, userId: String)
case class BbbMsgToClientEnvelope(name: String, routing: RoutingEnvelope)
case class BbbCoreEnvelope(name: String, routing: collection.immutable.Map[String, String])
case class BbbCommonEnvCoreMsg(envelope: BbbCoreEnvelope, core: BbbCoreMsg) extends BbbCommonMsg
case class BbbCommonEnvJsNodeMsg(envelope: BbbCoreEnvelope, core: JsonNode) extends BbbCommonMsg

case class BbbCoreBaseHeader(name: String) extends BbbCoreHeader
case class BbbCoreHeaderWithMeetingId(name: String, meetingId: String) extends BbbCoreHeader
case class BbbClientMsgHeader(name: String, meetingId: String, userId: String) extends BbbCoreHeader

case class BbbCoreMessageFromClient(header: BbbClientMsgHeader, body: JsonNode)

case class BbbCoreHeaderBody(header: BbbCoreHeader, body: JsonNode)

object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
case class CreateMeetingReqMsg(header: BbbCoreBaseHeader,
                               body: CreateMeetingReqMsgBody) extends BbbCoreMsg

object RegisterUserReqMsg { val NAME = "RegisterUserReqMsg" }
case class RegisterUserReqMsg(header: BbbCoreHeaderWithMeetingId,
                              body: RegisterUserReqMsgBody) extends BbbCoreMsg

object ValidateAuthTokenReqMsg { val NAME = "ValidateAuthTokenReqMsg" }
case class ValidateAuthTokenReqMsg(header: BbbClientMsgHeader,
                                   body: ValidateAuthTokenReqMsgBody) extends BbbCoreMsg


object UserJoinMeetingReqMsg { val NAME = "UserJoinMeetingReqMsg" }
case class UserJoinMeetingReqMsg(header: BbbClientMsgHeader, body: UserJoinMeetingReqMsgBody) extends BbbCoreMsg
case class UserJoinMeetingReqMsgBody(userId: String, authToken: String)

object UserLeaveReqMsg { val NAME = "UserLeaveReqMsg" }
case class UserLeaveReqMsg(header: BbbClientMsgHeader, body: UserLeaveReqMsgBody) extends BbbCoreMsg

object GetUsersReqMsg { val NAME = "GetUsersReqMsg" }
case class GetUsersReqMsg(header: BbbClientMsgHeader, body: GetUsersReqMsgBody) extends BbbCoreMsg

object UserBroadcastCamStartMsg { val NAME = "UserBroadcastCamStartMsg" }
case class UserBroadcastCamStartMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStartMsgBody) extends BbbCoreMsg

object UserBroadcastCamStopMsg { val NAME = "UserBroadcastCamStopMsg" }
case class UserBroadcastCamStopMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStopMsgBody) extends BbbCoreMsg

////////////////////////////////////////////////////////////////////////////////////// 
// Breakout room
/////////////////////////////////////////////////////////////////////////////////////

// Iconming messages
// Sent by user to request the breakout rooms list of a room
object BreakoutRoomsListMsg { val NAME = "BreakoutRoomsListMsg" }
case class BreakoutRoomsListMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListMsgBody) extends BbbCoreMsg

// Sent by user to request creation of breakout rooms
object CreateBreakoutRoomsMsg { val NAME = "CreateBreakoutRoomsMsg" }
case class CreateBreakoutRoomsMsg(header: BbbClientMsgHeader, body: CreateBreakoutRoomsMsgBody) extends BbbCoreMsg

object RequestBreakoutJoinURLMsg { val NAME = "RequestBreakoutJoinURLMsg" }
case class RequestBreakoutJoinURLMsg(header: BbbClientMsgHeader, body: RequestBreakoutJoinURLMsgBody) extends BbbCoreMsg

// Sent by breakout actor to tell meeting actor that breakout room has been created.
object BreakoutRoomCreatedMsg { val NAME = "BreakoutRoomCreatedMsg" }
case class BreakoutRoomCreatedMsg(header: BbbClientMsgHeader, body: BreakoutRoomCreatedMsgBody) extends BbbCoreMsg

// Sent by breakout actor to tell meeting actor the list of users in the breakout room.
object BreakoutRoomUsersUpdateMsg { val NAME = "BreakoutRoomUsersUpdateMsg" }
case class BreakoutRoomUsersUpdateMsg(header: BbbClientMsgHeader, body: BreakoutRoomUsersUpdateMsgBody) extends BbbCoreMsg

// Send by internal actor to tell the breakout actor to send it's list of users to the main meeting actor.
object SendBreakoutUsersUpdateMsg { val NAME = "SendBreakoutUsersUpdateMsg" }
case class SendBreakoutUsersUpdateMsg(header: BbbClientMsgHeader, body: SendBreakoutUsersUpdateMsgBody) extends BbbCoreMsg

// Sent by user to request ending all the breakout rooms
object EndAllBreakoutRoomsMsg { val NAME = "EndAllBreakoutRoomsMsg" }
case class EndAllBreakoutRoomsMsg(header: BbbClientMsgHeader, body: EndAllBreakoutRoomsMsgBody) extends BbbCoreMsg

// Sent by breakout actor to tell meeting actor that breakout room has been ended
object BreakoutRoomEndedMsg { val NAME = "BreakoutRoomEndedMsg" }
case class BreakoutRoomEndedMsg(header: BbbClientMsgHeader, body: BreakoutRoomEndedMsgBody) extends BbbCoreMsg

// Sent by user actor to ask for voice conference transfer 
object TransferUserToMeetingRequestMsg { val NAME = "TransferUserToMeetingRequestMsg" }
case class TransferUserToMeetingRequestMsg(header: BbbClientMsgHeader, body: TransferUserToMeetingRequestMsgBody) extends BbbCoreMsg

// Outgoing messages
object BreakoutRoomsListEvtMsg { val NAME = "BreakoutRoomsListEvtMsg" }
case class BreakoutRoomsListEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomsListEvtMsgBody) extends BbbCoreMsg

object CreateBreakoutRoomEvtMsg { val NAME = "CreateBreakoutRoomEvtMsg" }
case class CreateBreakoutRoomEvtMsg(header: BbbClientMsgHeader, body: CreateBreakoutRoomEvtMsgBody) extends BbbCoreMsg

object EndBreakoutRoomEvtMsg { val NAME = "EndBreakoutRoomEvtMsg" }
case class EndBreakoutRoomEvtMsg(header: BbbClientMsgHeader, body: EndBreakoutRoomEvtMsgBody) extends BbbCoreMsg

object BreakoutRoomJoinURLEvtMsg { val NAME = "BreakoutRoomJoinURLEvtMsg" }
case class BreakoutRoomJoinURLEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomJoinURLEvtMsgBody) extends BbbCoreMsg

object BreakoutRoomStartedEvtMsg { val NAME = "BreakoutRoomStartedEvtMsg" }
case class BreakoutRoomStartedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomStartedEvtMsgBody) extends BbbCoreMsg

object UpdateBreakoutUsersEvtMsg { val NAME = "UpdateBreakoutUsersEvtMsg" }
case class UpdateBreakoutUsersEvtMsg(header: BbbClientMsgHeader, body: UpdateBreakoutUsersEvtMsgBody) extends BbbCoreMsg

object MeetingTimeRemainingUpdateEvtMsg { val NAME = "MeetingTimeRemainingUpdateEvtMsg" }
case class MeetingTimeRemainingUpdateEvtMsg(header: BbbClientMsgHeader, body: MeetingTimeRemainingUpdateEvtMsgBody) extends BbbCoreMsg

object BreakoutRoomsTimeRemainingUpdateEvtMsg { val NAME = "BreakoutRoomsTimeRemainingUpdateEvtMsg" }
case class BreakoutRoomsTimeRemainingUpdateEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomsTimeRemainingUpdateEvtMsgBody) extends BbbCoreMsg

object BreakoutRoomEndedEvtMsg { val NAME = "BreakoutRoomEndedEvtMsg" }
case class BreakoutRoomEndedEvtMsg(header: BbbClientMsgHeader, body: BreakoutRoomEndedEvtMsgBody) extends BbbCoreMsg


/** Event messages sent by Akka apps as result of receiving incoming messages ***/
object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
case class MeetingCreatedEvtMsg(header: BbbCoreBaseHeader,
                                body: MeetingCreatedEvtBody) extends BbbCoreMsg

object ValidateAuthTokenRespMsg { val NAME = "ValidateAuthTokenRespMsg" }
case class ValidateAuthTokenRespMsg(header: BbbClientMsgHeader,
                                    body: ValidateAuthTokenRespMsgBody) extends BbbCoreMsg

object UserJoinedMeetingEvtMsg { val NAME = "UserJoinedMeetingEvtMsg" }
case class UserJoinedMeetingEvtMsg(header: BbbClientMsgHeader,
                                   body: UserJoinedMeetingEvtMsgBody) extends BbbCoreMsg
case class UserJoinedMeetingEvtMsgBody(intId: String, extId: String, name: String, role: String,
                                       guest: Boolean, authed: Boolean, waitingForAcceptance: Boolean, emoji: String,
                                       presenter: Boolean, locked: Boolean, avatar: String)

object UserBroadcastCamStartedEvtMsg { val NAME = "UserBroadcastCamStartedEvtMsg" }
case class UserBroadcastCamStartedEvtMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStartedEvtMsgBody) extends BbbCoreMsg

object UserBroadcastCamStoppedEvtMsg { val NAME = "UserBroadcastCamStoppedEvtMsg" }
case class UserBroadcastCamStoppedEvtMsg(header: BbbClientMsgHeader, body: UserBroadcastCamStoppedEvtMsgBody) extends BbbCoreMsg

/** System Messages **/
case class AkkaAppsCheckAliveReqBody(timestamp: Long)
case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg
