package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.domain.DefaultProps


sealed trait BbbCoreMsg

case class BbbCoreWithEvelopeMsg(envelope: Envelope, jsonNode: JsonNode)

case class Envelope(name: String, routing: collection.immutable.Map[String, String])

case class Header(name: String)
case class HeaderAndBody(header: Header, body: JsonNode)

case class AkkaAppsCheckAliveReqBody(timestamp: Long)
case class AkkaAppsCheckAliveReqMsg(header: Header, body: AkkaAppsCheckAliveReqBody)
case class AkkaAppsCheckAliveReq(envelope: Envelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg

case class ValidateAuthTokenReqBody(meetingId: String, userId: String, token: String, replyTo: String,
                                      @JsonProperty(required = true) sessionId: String)
case class ValidateAuthTokenReq(header: Header, body: ValidateAuthTokenReqBody) extends BbbCoreMsg

case class ValidateAuthTokenResp(meetingId: String, userId: String, token: String, valid: Boolean, replyTo: String)

case class CreateMeetingReqBody(props: DefaultProps)
case class CreateMeetingReq(header: Header, body: CreateMeetingReqBody) extends BbbCoreMsg

case class MeetingCreatedEvtBody(meetingId: String, record: Boolean)
case class MeetingCreatedEvt(header: Header, body: MeetingCreatedEvtBody)
