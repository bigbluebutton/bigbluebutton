package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.domain.DefaultProps


sealed trait BbbCoreMsg
sealed trait BbbCommonMsg

case class BbbCommonEnvCoreMsg(envelope: BbbCoreEnvelope, core: BbbCoreMsg) extends BbbCommonMsg
case class BbbCommonEnvJsNodeMsg(envelope: BbbCoreEnvelope, core: JsonNode) extends BbbCommonMsg


case class BbbCoreEnvelope(name: String, routing: collection.immutable.Map[String, String])
case class BbbCoreHeader(name: String)
case class BbbCoreHeaderBody(header: BbbCoreHeader, body: JsonNode)

case class AkkaAppsCheckAliveReqBody(timestamp: Long)
case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg

case class ValidateAuthTokenReqBody(meetingId: String, userId: String, token: String, replyTo: String,
                                      @JsonProperty(required = true) sessionId: String)
case class ValidateAuthTokenReq(header: BbbCoreHeader, body: ValidateAuthTokenReqBody) extends BbbCoreMsg

case class ValidateAuthTokenResp(meetingId: String, userId: String, token: String, valid: Boolean, replyTo: String)



object CreateMeetingReqMsg { val NAME = "CreateMeetingReqMsg" }
case class CreateMeetingReqMsg(header: BbbCoreHeader, body: CreateMeetingReqMsgBody) extends BbbCoreMsg
case class CreateMeetingReqMsgBody(props: DefaultProps)

object MeetingCreatedEvtMsg { val NAME = "MeetingCreatedEvtMsg"}
case class MeetingCreatedEvtMsg(header: BbbCoreHeader, body: MeetingCreatedEvtBody) extends BbbCoreMsg
case class MeetingCreatedEvtBody(props: DefaultProps)