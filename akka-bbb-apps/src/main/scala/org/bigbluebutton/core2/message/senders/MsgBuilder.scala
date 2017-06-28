package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.GuestWaiting

object MsgBuilder {
  def buildGuestsWaitingApprovalEvtMsg(meetingId: String, userId: String, guests: Vector[GuestWaiting]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestsWaitingApprovalEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestsWaitingApprovalEvtMsg.NAME, meetingId, userId)

    val guestsWaiting = guests.map(g => GuestWaitingVO(g.intId, g.name, g.role))
    val body = GuestsWaitingApprovalEvtMsgBody(guestsWaiting)
    val event = GuestsWaitingApprovalEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildValidateAuthTokenRespMsg(meetingId: String, userId: String, authToken: String,
    valid: Boolean, waitForApproval: Boolean): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(ValidateAuthTokenRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(ValidateAuthTokenRespMsg.NAME, meetingId, userId)
    val body = ValidateAuthTokenRespMsgBody(userId, authToken, valid, waitForApproval)
    val event = ValidateAuthTokenRespMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGetUsersMeetingRespMsg(meetingId: String, userId: String, webusers: Vector[WebUser]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetUsersMeetingRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetUsersMeetingRespMsgBody(webusers)
    val event = GetUsersMeetingRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGetWebcamStreamsMeetingRespMsg(meetingId: String, userId: String, streams: Vector[WebcamStreamVO]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetWebcamStreamsMeetingRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetWebcamStreamsMeetingRespMsg.NAME, meetingId, userId)

    val body = GetWebcamStreamsMeetingRespMsgBody(streams)
    val event = GetWebcamStreamsMeetingRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGetVoiceUsersMeetingRespMsg(meetingId: String, userId: String, voiceUsers: Vector[VoiceConfUser]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetVoiceUsersMeetingRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetVoiceUsersMeetingRespMsg.NAME, meetingId, userId)

    val body = GetVoiceUsersMeetingRespMsgBody(voiceUsers)
    val event = GetVoiceUsersMeetingRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildPresenterAssignedEvtMsg(meetingId: String, intId: String, name: String, assignedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, intId)
    val envelope = BbbCoreEnvelope(PresenterAssignedEvtMsg.NAME, routing)

    val body = PresenterAssignedEvtMsgBody(intId, name, assignedBy)
    val header = BbbClientMsgHeader(PresenterAssignedEvtMsg.NAME, meetingId, intId)
    val event = PresenterAssignedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
