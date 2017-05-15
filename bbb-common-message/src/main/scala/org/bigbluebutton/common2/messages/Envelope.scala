package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode


sealed trait BbbMsg

case class BbbServerMsg(envelope: Envelope, jsonNode: JsonNode)

case class Envelope(name: String, routing: collection.immutable.Map[String, String])

case class Header(name: String)
case class AkkaAppsCheckAliveReqBody(timestamp: Long)
case class AkkaAppsCheckAliveReqMsg(header: Header, body: AkkaAppsCheckAliveReqBody)
case class AkkaAppsCheckAliveReq(envelope: Envelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbMsg

case class ValidateAuthTokenReqBody(meetingId: String, userId: String, token: String, replyTo: String,
                                      @JsonProperty(required = true) sessionId: String)
case class ValidateAuthTokenReq(header: Header, body: ValidateAuthTokenReqBody) extends BbbMsg

case class ValidateAuthTokenResp(meetingId: String, userId: String, token: String, valid: Boolean, replyTo: String)

case class CreateMeetingReqBody(id: String, externalId: String,
                                  parentId: String, name: String, record: Boolean,
                                  voiceConfId: String, duration: Int,
                                  autoStartRecording: Boolean, allowStartStopRecording: Boolean,
                                  webcamsOnlyForModerator: Boolean, moderatorPass: String,
                                  viewerPass: String, createTime: Long, createDate: String,
                                  isBreakout: Boolean, sequence: Int,
                                  metadata: collection.immutable.Map[String, String], guestPolicy: String)
case class CreateMeetingReq(header: Header, body: CreateMeetingReqBody) extends BbbMsg

case class MeetingCreatedEvtBody(meetingId: String, record: Boolean)
case class MeetingCreatedEvt(header: Header, body: MeetingCreatedEvtBody)
