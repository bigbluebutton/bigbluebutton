package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.Permissions
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.MeetingStatus2x

trait GetLockSettingsReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetLockSettingsReqMsg(msg: GetLockSettingsReqMsg): Unit = {

    def build(meetingId: String, requestedBy: String, settings: Permissions): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, meetingId, requestedBy)
      val envelope = BbbCoreEnvelope(GetLockSettingsRespMsg.NAME, routing)
      val body = GetLockSettingsRespMsgBody(
        disableCam = settings.disableCam,
        disableMic = settings.disableMic, disablePrivChat = settings.disablePrivChat,
        disablePubChat = settings.disablePubChat, lockedLayout = settings.lockedLayout,
        lockOnJoin = settings.lockOnJoin, lockOnJoinConfigurable = settings.lockOnJoinConfigurable
      )
      val header = BbbClientMsgHeader(GetLockSettingsRespMsg.NAME, meetingId, requestedBy)
      val event = GetLockSettingsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val settings = MeetingStatus2x.getPermissions(liveMeeting.status)
    val event = build(props.meetingProp.intId, msg.body.requesterId, settings)
    outGW.send(event)
  }
}
