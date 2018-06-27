package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId, MessageTypes, Routing, ValidateConnAuthTokenSysRespMsg, ValidateConnAuthTokenSysRespMsgBody, _ }
import org.bigbluebutton.core.models.GuestWaiting

object MsgBuilder {
  def buildGuestPolicyChangedEvtMsg(meetingId: String, userId: String, policy: String, setBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestPolicyChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestPolicyChangedEvtMsg.NAME, meetingId, userId)

    val body = GuestPolicyChangedEvtMsgBody(policy, setBy)
    val event = GuestPolicyChangedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGuestApprovedEvtMsg(meetingId: String, userId: String, approved: Boolean, approvedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestApprovedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestApprovedEvtMsg.NAME, meetingId, userId)

    val body = GuestApprovedEvtMsgBody(approved, approvedBy)
    val event = GuestApprovedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGuestsWaitingApprovedEvtMsg(meetingId: String, userId: String,
                                       guests: Vector[GuestApprovedVO], approvedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestsWaitingApprovedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestsWaitingApprovedEvtMsg.NAME, meetingId, userId)

    val body = GuestsWaitingApprovedEvtMsgBody(guests, approvedBy)
    val event = GuestsWaitingApprovedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGetGuestsWaitingApprovalRespMsg(meetingId: String, userId: String, guests: Vector[GuestWaiting]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetGuestsWaitingApprovalRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val guestsWaiting = guests.map(g => GuestWaitingVO(g.intId, g.name, g.role))
    val body = GetGuestsWaitingApprovalRespMsgBody(guestsWaiting)
    val event = GetGuestsWaitingApprovalRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGuestsWaitingForApprovalEvtMsg(meetingId: String, userId: String, guests: Vector[GuestWaiting]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestsWaitingForApprovalEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestsWaitingForApprovalEvtMsg.NAME, meetingId, userId)

    val guestsWaiting = guests.map(g => GuestWaitingVO(g.intId, g.name, g.role))
    val body = GuestsWaitingForApprovalEvtMsgBody(guestsWaiting)
    val event = GuestsWaitingForApprovalEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildValidateConnAuthTokenSysRespMsg(meetingId: String, userId: String,
                                           authzed: Boolean, connId: String, app: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(ValidateConnAuthTokenSysRespMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(ValidateConnAuthTokenSysRespMsg.NAME, meetingId)
    val body = ValidateConnAuthTokenSysRespMsgBody(meetingId, userId, connId, authzed, app)
    val event = ValidateConnAuthTokenSysRespMsg(header, body)
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

  def buildMeetingCreatedEvtMsg(meetingId: String, props: DefaultProps): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MeetingCreatedEvtMsg.NAME, routing)
    val header = BbbCoreBaseHeader(MeetingCreatedEvtMsg.NAME)
    val body = MeetingCreatedEvtBody(props)
    val event = MeetingCreatedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildMeetingDestroyedEvtMsg(meetingId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MeetingDestroyedEvtMsg.NAME, routing)
    val body = MeetingDestroyedEvtMsgBody(meetingId)
    val header = BbbCoreBaseHeader(MeetingDestroyedEvtMsg.NAME)
    val event = MeetingDestroyedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildEndAndKickAllSysMsg(meetingId: String, userId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, meetingId, userId)
    val envelope = BbbCoreEnvelope(EndAndKickAllSysMsg.NAME, routing)
    val body = EndAndKickAllSysMsgBody(meetingId)
    val header = BbbCoreHeaderWithMeetingId(EndAndKickAllSysMsg.NAME, meetingId)
    val event = EndAndKickAllSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildDisconnectAllClientsSysMsg(meetingId: String, reason: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(DisconnectAllClientsSysMsg.NAME, routing)
    val body = DisconnectAllClientsSysMsgBody(meetingId, reason)
    val header = BbbCoreHeaderWithMeetingId(DisconnectAllClientsSysMsg.NAME, meetingId)
    val event = DisconnectAllClientsSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildEjectAllFromVoiceConfMsg(meetingId: String, voiceConf: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(EjectAllFromVoiceConfMsg.NAME, routing)
    val body = EjectAllFromVoiceConfMsgBody(voiceConf)
    val header = BbbCoreHeaderWithMeetingId(EjectAllFromVoiceConfMsg.NAME, meetingId)
    val event = EjectAllFromVoiceConfMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserEjectedFromMeetingEvtMsg(meetingId: String, userId: String, ejectedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserEjectedFromMeetingEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserEjectedFromMeetingEvtMsg.NAME, meetingId, userId)
    val body = UserEjectedFromMeetingEvtMsgBody(userId, ejectedBy)
    val event = UserEjectedFromMeetingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildDisconnectClientSysMsg(meetingId: String, userId: String, reason: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, meetingId, userId)
    val envelope = BbbCoreEnvelope(DisconnectClientSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(DisconnectClientSysMsg.NAME, meetingId)
    val body = DisconnectClientSysMsgBody(meetingId, userId, reason)
    val event = DisconnectClientSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserLeftMeetingEvtMsg(meetingId: String, userId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserLeftMeetingEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserLeftMeetingEvtMsg.NAME, meetingId, userId)
    val body = UserLeftMeetingEvtMsgBody(userId)
    val event = UserLeftMeetingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildCheckAlivePingSysMsg(system: String, timestamp: Long): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(CheckAlivePongSysMsg.NAME, routing)
    val body = CheckAlivePongSysMsgBody(system, timestamp)
    val header = BbbCoreBaseHeader(CheckAlivePongSysMsg.NAME)
    val event = CheckAlivePongSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildEjectUserFromVoiceConfSysMsg(meetingId: String, voiceConf: String, voiceUserId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(EjectUserFromVoiceConfSysMsg.NAME, routing)
    val body = EjectUserFromVoiceConfSysMsgBody(voiceConf, voiceUserId)
    val header = BbbCoreHeaderWithMeetingId(EjectUserFromVoiceConfSysMsg.NAME, meetingId)
    val event = EjectUserFromVoiceConfSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildMuteUserInVoiceConfSysMsg(meetingId: String, voiceConf: String, voiceUserId: String, mute: Boolean): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MuteUserInVoiceConfSysMsg.NAME, routing)
    val body = MuteUserInVoiceConfSysMsgBody(voiceConf, voiceUserId, mute)
    val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfSysMsg.NAME, meetingId)
    val event = MuteUserInVoiceConfSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildBreakoutRoomEndedEvtMsg(meetingId: String, userId: String, breakoutRoomId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(BreakoutRoomEndedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(BreakoutRoomEndedEvtMsg.NAME, meetingId, userId)

    val body = BreakoutRoomEndedEvtMsgBody(meetingId, breakoutRoomId)
    val event = BreakoutRoomEndedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildStopMeetingTranscodersSysCmdMsg(meetingId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StopMeetingTranscodersSysCmdMsg.NAME, routing)
    val body = StopMeetingTranscodersSysCmdMsgBody()
    val header = BbbCoreHeaderWithMeetingId(StopMeetingTranscodersSysCmdMsg.NAME, meetingId)
    val event = StopMeetingTranscodersSysCmdMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
