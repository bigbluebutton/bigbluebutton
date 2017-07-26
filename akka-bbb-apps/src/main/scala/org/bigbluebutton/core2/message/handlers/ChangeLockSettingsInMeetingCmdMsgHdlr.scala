package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.api.Permissions
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait ChangeLockSettingsInMeetingCmdMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSetLockSettings(msg: ChangeLockSettingsInMeetingCmdMsg): Unit = {
    val settings = Permissions(
      disableCam = msg.body.disableCam,
      disableMic = msg.body.disableMic,
      disablePrivChat = msg.body.disablePrivChat,
      disablePubChat = msg.body.disablePubChat,
      lockedLayout = msg.body.lockedLayout,
      lockOnJoin = msg.body.lockOnJoin,
      lockOnJoinConfigurable = msg.body.lockOnJoinConfigurable
    )

    if (!liveMeeting.permissionsEqual(settings)) {
      liveMeeting.newPermissions(settings)

      def build(meetingId: String, userId: String, settings: Permissions, setBy: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
        val envelope = BbbCoreEnvelope(LockSettingsInMeetingChangedEvtMsg.NAME, routing)
        val body = LockSettingsInMeetingChangedEvtMsgBody(
          disableCam = settings.disableCam,
          disableMic = settings.disableMic, disablePrivChat = settings.disablePrivChat,
          disablePubChat = settings.disablePubChat, lockedLayout = settings.lockedLayout,
          lockOnJoin = settings.lockOnJoin, lockOnJoinConfigurable = settings.lockOnJoinConfigurable,
          setBy
        )
        val header = BbbClientMsgHeader(LockSettingsInMeetingChangedEvtMsg.NAME, meetingId, userId)
        val event = LockSettingsInMeetingChangedEvtMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val event = build(props.meetingProp.intId, msg.body.setBy, settings, msg.body.setBy)
      outGW.send(event)

      processLockLayout(settings.lockedLayout, msg.body.setBy)
    }
  }

  def processLockLayout(lock: Boolean, setBy: String): Unit = {

    def broadcastEvent(lock: Boolean, setBy: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, setBy)
      val envelope = BbbCoreEnvelope(LockLayoutEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(LockLayoutEvtMsg.NAME, liveMeeting.props.meetingProp.intId, setBy)

      val body = LockLayoutEvtMsgBody(setBy, lock, affectedUsers)
      val event = LockLayoutEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    liveMeeting.lockLayout(lock)

    broadcastEvent(lock, setBy)

  }
}
