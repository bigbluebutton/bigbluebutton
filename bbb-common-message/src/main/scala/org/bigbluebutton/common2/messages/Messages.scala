package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.messages.MessageBody._

object MessageTypes {
  val DIRECT = "DIRECT"
  val BROADCAST = "BROADCAST"
  val SYSTEM = "SYSTEM"
}

// seal trait to force all classes that extends this trait to be defined in this file.
sealed trait BbbCoreMsg
sealed trait BbbCommonMsg
sealed trait BbbCoreHeader

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
object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
case class MeetingCreatedEvtMsg(header: BbbCoreBaseHeader,
                                body: MeetingCreatedEvtBody) extends BbbCoreMsg
object RegisterUserReqMsg { val NAME = "RegisterUserReqMsg" }
case class RegisterUserReqMsg(header: BbbCoreHeaderWithMeetingId,
                              body: RegisterUserReqMsgBody) extends BbbCoreMsg
object ValidateAuthTokenReqMsg { val NAME = "ValidateAuthTokenReqMsg" }
case class ValidateAuthTokenReqMsg(header: BbbCoreHeaderWithMeetingId,
                                   body: ValidateAuthTokenReqMsgBody) extends BbbCoreMsg


object UserJoinReqMsg { val NAME = "UserJoinReqMsg" }
case class UserJoinReqMsg(header: BbbClientMsgHeader, body: UserJoinReqMsgBody) extends BbbCoreMsg

object UserLeaveReqMsg { val NAME = "UserLeaveReqMsg" }
case class UserLeaveReqMsg(header: BbbClientMsgHeader, body: UserLeaveReqMsgBody) extends BbbCoreMsg

object GetUsersReqMsg { val NAME = "GetUsersReqMsg" }
case class GetUsersReqMsg(header: BbbClientMsgHeader, body: GetUsersReqMsgBody) extends BbbCoreMsg

object UserShareWebcamMsg { val NAME = "UserShareWebcamMsg" }
case class UserShareWebcamMsg(header: BbbClientMsgHeader, body: UserShareWebcamMsgBody)

/** Event messages sent by Akka apps as result of receiving incoming messages ***/
object ValidateAuthTokenRespMsg { val NAME = "ValidateAuthTokenRespMsg" }
case class ValidateAuthTokenRespMsg(header: BbbClientMsgHeader,
                                    body: ValidateAuthTokenRespMsgBody) extends BbbCoreMsg

object UserSharedWebcamEvtMsg { val NAME = "UserSharedWebcamEvtMsg" }
case class UserSharedWebcamEvtMsg(header: BbbClientMsgHeader, body: UserSharedWebcamEvtMsgBody)

object UserUnsharedWebcamEvtMsg { val NAME = "UserUnsharedWebcamEvtMsg" }
case class UserUnsharedWebcamEvtMsg(header: BbbClientMsgHeader, body: UserUnsharedWebcamEvtMsgBody)


/** System Messages **/
case class AkkaAppsCheckAliveReqBody(timestamp: Long)
case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg


