package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.messages.MessageBody._


sealed trait BbbCoreMsg
sealed trait BbbCommonMsg
sealed trait BbbCoreHeader

case class BbbCommonEnvCoreMsg(envelope: BbbCoreEnvelope, core: BbbCoreMsg) extends BbbCommonMsg
case class BbbCommonEnvJsNodeMsg(envelope: BbbCoreEnvelope, core: JsonNode) extends BbbCommonMsg
case class BbbCoreEnvelope(name: String, routing: collection.immutable.Map[String, String])

case class BbbCoreBaseHeader(name: String) extends BbbCoreHeader
case class BbbCoreHeaderWithMeetingId(name: String, meetingId: String) extends BbbCoreHeader

case class BbbCoreHeaderBody(header: BbbCoreHeader, body: JsonNode)


object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
case class CreateMeetingReqMsg(header: BbbCoreBaseHeader,
                               body: CreateMeetingReqMsgBody) extends BbbCoreMsg

object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
case class MeetingCreatedEvtMsg(header: BbbCoreBaseHeader,
                                body: MeetingCreatedEvtBody) extends BbbCoreMsg

object RegisterUserReqMsg { val NAME = "RegisterUserReqMsg" }
case class RegisterUserReqMsg(header: BbbCoreHeaderWithMeetingId,
                              body: RegisterUserReqMsgBody)

object ValidateAuthTokenReqMsg { val NAME = "ValidateAuthTokenReqMsg" }
case class ValidateAuthTokenReqMsg(header: BbbCoreHeaderWithMeetingId,
                                   body: ValidateAuthTokenReqMsgBody) extends BbbCoreMsg

object ValidateAuthTokenRespMsg { val NAME = "ValidateAuthTokenRespMsg" }
case class ValidateAuthTokenRespMsg(header: BbbCoreHeaderWithMeetingId,
                                    body: ValidateAuthTokenRespMsgBody) extends BbbCoreMsg

case class AkkaAppsCheckAliveReqBody(timestamp: Long)
case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg


