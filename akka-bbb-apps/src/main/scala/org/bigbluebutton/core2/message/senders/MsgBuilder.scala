package org.bigbluebutton.core2.message.senders

import org.bigbluebutton.common2.domain.DefaultProps
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvCoreMsg, BbbCoreEnvelope, BbbCoreHeaderWithMeetingId, MessageTypes, NotifyAllInMeetingEvtMsg, NotifyAllInMeetingEvtMsgBody, NotifyRoleInMeetingEvtMsg, NotifyRoleInMeetingEvtMsgBody, NotifyUserInMeetingEvtMsg, NotifyUserInMeetingEvtMsgBody, Routing, _ }
import org.bigbluebutton.core.models.{ GuestWaiting, PresentationPod }

object MsgBuilder {
  def buildGuestPolicyChangedEvtMsg(meetingId: String, userId: String, policy: String, setBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestPolicyChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestPolicyChangedEvtMsg.NAME, meetingId, userId)

    val body = GuestPolicyChangedEvtMsgBody(policy, setBy)
    val event = GuestPolicyChangedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildPosInWaitingQueueUpdatedRespMsg(meetingId: String, guests: Vector[GuestWaitingUP]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(PosInWaitingQueueUpdatedRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(PosInWaitingQueueUpdatedRespMsg.NAME, meetingId, "not-used")

    val guestsWaiting = guests.map(g => GuestWaitingUP(g.intId, g.idx))
    val body = PosInWaitingQueueUpdatedRespMsgBody(guestsWaiting)
    val event = PosInWaitingQueueUpdatedRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGuestLobbyMessageChangedEvtMsg(meetingId: String, userId: String, message: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestLobbyMessageChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestLobbyMessageChangedEvtMsg.NAME, meetingId, userId)

    val body = GuestLobbyMessageChangedEvtMsgBody(message)
    val event = GuestLobbyMessageChangedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildPrivateGuestLobbyMsgChangedEvtMsg(meetingId: String, userId: String, guestId: String, message: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(PrivateGuestLobbyMsgChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(PrivateGuestLobbyMsgChangedEvtMsg.NAME, meetingId, userId)

    val body = PrivateGuestLobbyMsgChangedEvtMsgBody(guestId, message)
    val event = PrivateGuestLobbyMsgChangedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGuestApprovedEvtMsg(meetingId: String, userId: String, status: String, approvedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestApprovedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestApprovedEvtMsg.NAME, meetingId, userId)

    val body = GuestApprovedEvtMsgBody(status, approvedBy)
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

    val guestsWaiting = guests.map(g => GuestWaitingVO(g.intId, g.name, g.role, g.guest, g.avatar, g.color, g.authenticated, g.registeredOn))
    val body = GetGuestsWaitingApprovalRespMsgBody(guestsWaiting)
    val event = GetGuestsWaitingApprovalRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGuestsWaitingForApprovalEvtMsg(meetingId: String, userId: String, guests: Vector[GuestWaiting]): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestsWaitingForApprovalEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestsWaitingForApprovalEvtMsg.NAME, meetingId, userId)

    val guestsWaiting = guests.map(g => GuestWaitingVO(g.intId, g.name, g.role, g.guest, g.avatar, g.color, g.authenticated, g.registeredOn))
    val body = GuestsWaitingForApprovalEvtMsgBody(guestsWaiting)
    val event = GuestsWaitingForApprovalEvtMsg(header, body)

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

  def buildStopExternalVideoEvtMsg(meetingId: String, userId: String = "not-used"): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, "nodeJSapp")
    val envelope = BbbCoreEnvelope(StopExternalVideoEvtMsg.NAME, routing)

    val body = StopExternalVideoEvtMsgBody()
    val header = BbbClientMsgHeader(StopExternalVideoEvtMsg.NAME, meetingId, userId)
    val event = StopExternalVideoEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildStopScreenshareRtmpBroadcastEvtMsg(
      meetingId: String,
      voiceConf: String, screenshareConf: String,
      userId: String,
      stream: String, vidWidth: Int, vidHeight: Int,
      timestamp: String
  ): BbbCommonEnvCoreMsg = {

    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, "not-used")
    val envelope = BbbCoreEnvelope(ScreenshareRtmpBroadcastStoppedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(ScreenshareRtmpBroadcastStoppedEvtMsg.NAME, meetingId, "not-used")
    val body = ScreenshareRtmpBroadcastStoppedEvtMsgBody(voiceConf, screenshareConf, userId, stream, vidWidth, vidHeight, timestamp)
    val event = ScreenshareRtmpBroadcastStoppedEvtMsg(header, body)
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

  def buildMeetingInfoAnalyticsMsg(analytics: MeetingInfoAnalytics): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MeetingInfoAnalyticsMsg.NAME, routing)
    val header = BbbCoreBaseHeader(MeetingInfoAnalyticsMsg.NAME)
    val body = MeetingInfoAnalyticsMsgBody(analytics)
    val event = MeetingInfoAnalyticsMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildMeetingInfoAnalyticsServiceMsg(analytics: MeetingInfoAnalytics): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MeetingInfoAnalyticsServiceMsg.NAME, routing)
    val header = BbbCoreBaseHeader(MeetingInfoAnalyticsServiceMsg.NAME)
    val body = MeetingInfoAnalyticsMsgBody(analytics)
    val event = MeetingInfoAnalyticsServiceMsg(header, body)
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

  def buildRecordStatusResetSysMsg(meetingId: String, recording: Boolean, setBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, meetingId, setBy)
    val envelope = BbbCoreEnvelope(RecordStatusResetSysMsg.NAME, routing)
    val body = RecordStatusResetSysMsgBody(recording, setBy)
    val header = BbbCoreHeaderWithMeetingId(RecordStatusResetSysMsg.NAME, meetingId)
    val event = RecordStatusResetSysMsg(header, body)

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

  def buildForceUserGraphqlReconnectionSysMsg(meetingId: String, userId: String, sessionToken: String, reason: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, meetingId, userId)
    val envelope = BbbCoreEnvelope(ForceUserGraphqlReconnectionSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(ForceUserGraphqlReconnectionSysMsg.NAME, meetingId)
    val body = ForceUserGraphqlReconnectionSysMsgBody(meetingId, userId, sessionToken, reason)
    val event = ForceUserGraphqlReconnectionSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildForceUserGraphqlDisconnectionSysMsg(meetingId: String, userId: String, sessionToken: String, reason: String, reasonMsgId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, meetingId, userId)
    val envelope = BbbCoreEnvelope(ForceUserGraphqlDisconnectionSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(ForceUserGraphqlDisconnectionSysMsg.NAME, meetingId)
    val body = ForceUserGraphqlDisconnectionSysMsgBody(meetingId, userId, sessionToken, reason, reasonMsgId)
    val event = ForceUserGraphqlDisconnectionSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildCheckGraphqlMiddlewareAlivePingSysMsg(middlewareUid: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.SYSTEM, "", "")
    val envelope = BbbCoreEnvelope(CheckGraphqlMiddlewareAlivePingSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(CheckGraphqlMiddlewareAlivePingSysMsg.NAME, "")
    val body = CheckGraphqlMiddlewareAlivePingSysMsgBody(middlewareUid)
    val event = CheckGraphqlMiddlewareAlivePingSysMsg(header, body)

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

  def buildGuestWaitingLeftEvtMsg(meetingId: String, userId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(GuestWaitingLeftEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(GuestWaitingLeftEvtMsg.NAME, meetingId, userId)
    val body = GuestWaitingLeftEvtMsgBody(userId)
    val event = GuestWaitingLeftEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserLeftMeetingEvtMsg(meetingId: String, userId: String, eject: Boolean = false, ejectedBy: String = "", reason: String = "", reasonCode: String = ""): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserLeftMeetingEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserLeftMeetingEvtMsg.NAME, meetingId, userId)
    val body = UserLeftMeetingEvtMsgBody(userId, eject, ejectedBy, reason, reasonCode)
    val event = UserLeftMeetingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserLeftFlagUpdatedEvtMsg(meetingId: String, userId: String, userLeftFlag: Boolean): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserLeftFlagUpdatedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserLeftFlagUpdatedEvtMsg.NAME, meetingId, userId)
    val body = UserLeftFlagUpdatedEvtMsgBody(userId, userLeftFlag)
    val event = UserLeftFlagUpdatedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserInactivityInspectMsg(meetingId: String, userId: String, responseDelay: Long): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserInactivityInspectMsg.NAME, routing)
    val body = UserInactivityInspectMsgBody(meetingId, responseDelay)
    val header = BbbClientMsgHeader(UserInactivityInspectMsg.NAME, meetingId, userId)
    val event = UserInactivityInspectMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildCheckAlivePingSysMsg(system: String, bbbWebTimestamp: Long, akkaAppsTimestamp: Long): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(CheckAlivePongSysMsg.NAME, routing)
    val body = CheckAlivePongSysMsgBody(system, bbbWebTimestamp, akkaAppsTimestamp)
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

  def buildMeetingMutedEvtMsg(meetingId: String, userId: String, muted: Boolean, mutedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(MeetingMutedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(MeetingMutedEvtMsg.NAME, meetingId, userId)

    val body = MeetingMutedEvtMsgBody(muted, mutedBy)
    val event = MeetingMutedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildMuteUserInVoiceConfSysMsg(
    meetingId: String,
    voiceConf: String,
    intId: String,
    voiceUserId: String,
    mute: Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(MuteUserInVoiceConfSysMsg.NAME, routing)
    val body = MuteUserInVoiceConfSysMsgBody(voiceConf, intId, voiceUserId, mute)
    val header = BbbCoreHeaderWithMeetingId(MuteUserInVoiceConfSysMsg.NAME, meetingId)
    val event = MuteUserInVoiceConfSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildDeafUserInVoiceConfSysMsg(
    meetingId: String,
    voiceConf: String,
    userId: String,
    voiceUserId: String,
    deaf: Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(DeafUserInVoiceConfSysMsg.NAME, routing)
    val body = DeafUserInVoiceConfSysMsgBody(voiceConf, userId, voiceUserId, deaf)
    val header = BbbCoreHeaderWithMeetingId(DeafUserInVoiceConfSysMsg.NAME, meetingId)
    val event = DeafUserInVoiceConfSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildHoldUserInVoiceConfSysMsg(meetingId: String, voiceConf: String, voiceUserId: String, hold: Boolean): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(HoldUserInVoiceConfSysMsg.NAME, routing)
    val body = HoldUserInVoiceConfSysMsgBody(voiceConf, voiceUserId, hold)
    val header = BbbCoreHeaderWithMeetingId(HoldUserInVoiceConfSysMsg.NAME, meetingId)
    val event = HoldUserInVoiceConfSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildPlaySoundInVoiceConfSysMsg(meetingId: String, voiceConf: String, voiceUserId: String, soundPath: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(PlaySoundInVoiceConfSysMsg.NAME, routing)
    val body = PlaySoundInVoiceConfSysMsgBody(voiceConf, voiceUserId, soundPath)
    val header = BbbCoreHeaderWithMeetingId(PlaySoundInVoiceConfSysMsg.NAME, meetingId)
    val event = PlaySoundInVoiceConfSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildStopSoundInVoiceConfSysMsg(meetingId: String, voiceConf: String, voiceUserId: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StopSoundInVoiceConfSysMsg.NAME, routing)
    val body = StopSoundInVoiceConfSysMsgBody(voiceConf, voiceUserId)
    val header = BbbCoreHeaderWithMeetingId(StopSoundInVoiceConfSysMsg.NAME, meetingId)
    val event = StopSoundInVoiceConfSysMsg(header, body)

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

  def buildRecordingChapterBreakSysMsg(meetingId: String, timestamp: Long): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(RecordingChapterBreakSysMsg.NAME, routing)
    val body = RecordingChapterBreakSysMsgBody(meetingId, timestamp)
    val header = BbbCoreHeaderWithMeetingId(RecordingChapterBreakSysMsg.NAME, meetingId)
    val event = RecordingChapterBreakSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildLastcheckVoiceConfUsersStatus(meetingId: String, voiceConf: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(GetUsersStatusToVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(GetUsersStatusToVoiceConfSysMsg.NAME, meetingId)
    val body = GetUsersStatusToVoiceConfSysMsgBody(voiceConf, meetingId)
    val event = GetUsersStatusToVoiceConfSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildCheckRunningAndRecordingToVoiceConfSysMsg(meetingId: String, voiceConf: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(CheckRunningAndRecordingToVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(CheckRunningAndRecordingToVoiceConfSysMsg.NAME, meetingId)
    val body = CheckRunningAndRecordingToVoiceConfSysMsgBody(voiceConf, meetingId)
    val event = CheckRunningAndRecordingToVoiceConfSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildStartRecordingVoiceConfSysMsg(meetingId: String, voiceConf: String, stream: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StartRecordingVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(StartRecordingVoiceConfSysMsg.NAME, meetingId)
    val body = StartRecordingVoiceConfSysMsgBody(voiceConf, meetingId, stream)
    val event = StartRecordingVoiceConfSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildStopRecordingVoiceConfSysMsg(meetingId: String, voiceConf: String, stream: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(StopRecordingVoiceConfSysMsg.NAME, routing)
    val header = BbbCoreHeaderWithMeetingId(StopRecordingVoiceConfSysMsg.NAME, meetingId)
    val body = StopRecordingVoiceConfSysMsgBody(voiceConf, meetingId, stream)
    val event = StopRecordingVoiceConfSysMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildCreateNewPresentationPodEvtMsg(meetingId: String, currentPresenterId: String, podId: String, userId: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(CreateNewPresentationPodEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(CreateNewPresentationPodEvtMsg.NAME, meetingId, userId)

    val body = CreateNewPresentationPodEvtMsgBody(currentPresenterId, podId)
    val event = CreateNewPresentationPodEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGetScreenSubscribePermissionRespMsg(
      meetingId:    String,
      voiceConf:    String,
      userId:       String,
      streamId:     String,
      sfuSessionId: String,
      allowed:      Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetScreenSubscribePermissionRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetScreenSubscribePermissionRespMsg.NAME, meetingId, userId)
    val body = GetScreenSubscribePermissionRespMsgBody(
      meetingId,
      voiceConf,
      userId,
      streamId,
      sfuSessionId,
      allowed
    )
    val event = GetScreenSubscribePermissionRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGetScreenBroadcastPermissionRespMsg(
      meetingId:    String,
      voiceConf:    String,
      userId:       String,
      sfuSessionId: String,
      allowed:      Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, userId)
    val envelope = BbbCoreEnvelope(GetScreenBroadcastPermissionRespMsg.NAME, routing)
    val header = BbbClientMsgHeader(GetScreenBroadcastPermissionRespMsg.NAME, meetingId, userId)

    val body = GetScreenBroadcastPermissionRespMsgBody(
      meetingId,
      voiceConf,
      userId,
      sfuSessionId,
      allowed
    )
    val event = GetScreenBroadcastPermissionRespMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildLearningDashboardEvtMsg(meetingId: String, learningDashboardAccessToken: String, activityJson: String): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(LearningDashboardEvtMsg.NAME, routing)
    val body = LearningDashboardEvtMsgBody(learningDashboardAccessToken, activityJson)
    val header = BbbCoreHeaderWithMeetingId(LearningDashboardEvtMsg.NAME, meetingId)
    val event = LearningDashboardEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildEjectUserFromSfuSysMsg(
      meetingId: String,
      userId:    String
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(EjectUserFromSfuSysMsg.NAME, routing)
    val body = EjectUserFromSfuSysMsgBody(userId)
    val header = BbbCoreHeaderWithMeetingId(EjectUserFromSfuSysMsg.NAME, meetingId)
    val event = EjectUserFromSfuSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildNotifyAllInMeetingEvtMsg(
      meetingId:          String,
      notificationType:   String,
      icon:               String,
      messageId:          String,
      messageDescription: String,
      messageValues:      Map[String, String]
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(NotifyAllInMeetingEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(NotifyAllInMeetingEvtMsg.NAME, meetingId, "not-used")
    val body = NotifyAllInMeetingEvtMsgBody(meetingId, notificationType, icon, messageId, messageDescription, messageValues)
    val event = NotifyAllInMeetingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildNotifyRoleInMeetingEvtMsg(
      role:               String,
      meetingId:          String,
      notificationType:   String,
      icon:               String,
      messageId:          String,
      messageDescription: String,
      messageValues:      Map[String, String]
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(NotifyRoleInMeetingEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(NotifyRoleInMeetingEvtMsg.NAME, meetingId, "not-used")
    val body = NotifyRoleInMeetingEvtMsgBody(role, meetingId, notificationType, icon, messageId, messageDescription, messageValues)
    val event = NotifyRoleInMeetingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildNotifyUserInMeetingEvtMsg(
      userId:             String,
      meetingId:          String,
      notificationType:   String,
      icon:               String,
      messageId:          String,
      messageDescription: String,
      messageValues:      Map[String, String]
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(NotifyUserInMeetingEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(NotifyUserInMeetingEvtMsg.NAME, meetingId, "not-used")
    val body = NotifyUserInMeetingEvtMsgBody(userId, meetingId, notificationType, icon, messageId, messageDescription, messageValues)
    val event = NotifyUserInMeetingEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildScreenBroadcastStopSysMsg(
      meetingId: String,
      voiceConf: String,
      userId:    String,
      streamId:  String
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(ScreenBroadcastStopSysMsg.NAME, routing)
    val body = ScreenBroadcastStopSysMsgBody(meetingId, voiceConf, userId, streamId)
    val header = BbbCoreBaseHeader(ScreenBroadcastStopSysMsg.NAME)
    val event = ScreenBroadcastStopSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserAwayChangedEvtMsg(meetingId: String, userId: String, away: Boolean) = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserAwayChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserAwayChangedEvtMsg.NAME, meetingId, userId)
    val body = UserAwayChangedEvtMsgBody(userId, away)
    val event = UserAwayChangedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserRaiseHandChangedEvtMsg(meetingId: String, userId: String, raiseHand: Boolean) = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserRaiseHandChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserRaiseHandChangedEvtMsg.NAME, meetingId, userId)
    val body = UserRaiseHandChangedEvtMsgBody(userId, raiseHand)
    val event = UserRaiseHandChangedEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildHoldChannelInVoiceConfSysMsg(
      meetingId: String,
      voiceConf: String,
      uuid:      String,
      hold:      Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(HoldChannelInVoiceConfSysMsg.NAME, routing)
    val body = HoldChannelInVoiceConfSysMsgBody(voiceConf, uuid, hold)
    val header = BbbCoreHeaderWithMeetingId(HoldChannelInVoiceConfSysMsg.NAME, meetingId)
    val event = HoldChannelInVoiceConfSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildToggleListenOnlyModeSysMsg(
      meetingId: String,
      voiceConf: String,
      userId:    String,
      callerNum: String,
      enabled:   Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(ToggleListenOnlyModeSysMsg.NAME, routing)
    val body = ToggleListenOnlyModeSysMsgBody(voiceConf, userId, callerNum, enabled)
    val header = BbbCoreHeaderWithMeetingId(ToggleListenOnlyModeSysMsg.NAME, meetingId)
    val event = ToggleListenOnlyModeSysMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildGenerateLiveKitTokenReqMsg(
    meetingId: String,
    userId: String,
    userName: String,
    grant: LiveKitGrant,
    metadata: LiveKitParticipantMetadata,
  ): BbbCommonEnvCoreMsg = {
    val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
    val envelope = BbbCoreEnvelope(GenerateLiveKitTokenReqMsg.NAME, routing)
    val body = GenerateLiveKitTokenReqMsgBody(userId, userName, grant, metadata)
    val header = BbbCoreHeaderWithMeetingId(GenerateLiveKitTokenReqMsg.NAME, meetingId)
    val event = GenerateLiveKitTokenReqMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserTalkingVoiceEvtMsg(
    meetingId: String,
    voiceConf: String,
    userId: String,
    voiceUserId: String,
    talking: Boolean
  ): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserTalkingVoiceEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserTalkingVoiceEvtMsg.NAME, meetingId, userId)
    val body = UserTalkingVoiceEvtMsgBody(
      voiceConf,
      userId,
      voiceUserId,
      talking
    )
    val event = UserTalkingVoiceEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildUserLeftVoiceConfToClientEvtMsg(
    meetingId: String,
    userId: String,
    voiceConf: String,
    voiceUserId: String
  ): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(UserLeftVoiceConfToClientEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(UserLeftVoiceConfToClientEvtMsg.NAME, meetingId, userId)
    val body = UserLeftVoiceConfToClientEvtMsgBody(voiceConf, userId, voiceUserId)
    val event = UserLeftVoiceConfToClientEvtMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def buildAudioFloorChangedEvtMsg(
    meetingId: String,
    voiceConf: String,
    userId: String,
    voiceUserId: String,
    floor: Boolean,
    lastFloorTime: String
  ): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
    val envelope = BbbCoreEnvelope(AudioFloorChangedEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(AudioFloorChangedEvtMsg.NAME, meetingId, userId)
    val body = AudioFloorChangedEvtMsgBody(voiceConf, userId, voiceUserId, floor, lastFloorTime)
    val event = AudioFloorChangedEvtMsg(header, body)

    BbbCommonEnvCoreMsg(envelope, event)
  }
}
