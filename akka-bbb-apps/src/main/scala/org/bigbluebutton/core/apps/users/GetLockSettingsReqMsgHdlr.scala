package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter, LiveMeeting }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.core2.Permissions
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x

trait GetLockSettingsReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def buildLockSettingsResp(meetingId: String, requestedBy: String, settings: Permissions): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, requestedBy)
    val envelope = BbbCoreEnvelope(GetLockSettingsRespMsg.NAME, routing)
    val body = GetLockSettingsRespMsgBody(
      disableCam = settings.disableCam,
      disableMic = settings.disableMic,
      disablePrivChat = settings.disablePrivChat,
      disablePubChat = settings.disablePubChat,
      disableNote = settings.disableNote,
      hideUserList = settings.hideUserList,
      lockedLayout = settings.lockedLayout,
      lockOnJoin = settings.lockOnJoin,
      lockOnJoinConfigurable = settings.lockOnJoinConfigurable
    )
    val header = BbbClientMsgHeader(GetLockSettingsRespMsg.NAME, meetingId, requestedBy)
    val event = GetLockSettingsRespMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }
  def buildNotInitializedResp(meetingId: String, requestedBy: String): BbbCommonEnvCoreMsg = {
    val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, requestedBy)
    val envelope = BbbCoreEnvelope(LockSettingsNotInitializedRespMsg.NAME, routing)
    val body = LockSettingsNotInitializedRespMsgBody(requestedBy)
    val header = BbbClientMsgHeader(LockSettingsNotInitializedRespMsg.NAME, meetingId, requestedBy)
    val event = LockSettingsNotInitializedRespMsg(header, body)
    BbbCommonEnvCoreMsg(envelope, event)
  }

  def handleGetLockSettingsReqMsg(msg: GetLockSettingsReqMsg): Unit = {
    if (MeetingStatus2x.permisionsInitialized(liveMeeting.status)) {
      val settings = MeetingStatus2x.getPermissions(liveMeeting.status)
      val event = buildLockSettingsResp(props.meetingProp.intId, msg.body.requesterId, settings)
      outGW.send(event)
    } else {
      val event = buildNotInitializedResp(props.meetingProp.intId, msg.body.requesterId)
      outGW.send(event)
    }
  }

  def handleSyncGetLockSettingsMsg(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    if (MeetingStatus2x.permisionsInitialized(liveMeeting.status)) {
      val settings = MeetingStatus2x.getPermissions(liveMeeting.status)
      val event = buildLockSettingsResp(props.meetingProp.intId, "nodeJSapp", settings)
      bus.outGW.send(event)
    } else {
      val event = buildNotInitializedResp(props.meetingProp.intId, "nodeJSapp")
      bus.outGW.send(event)
    }

    state
  }
}
