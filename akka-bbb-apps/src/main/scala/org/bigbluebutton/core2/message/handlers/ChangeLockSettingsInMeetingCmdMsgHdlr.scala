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

      val routing = Routing.addMsgToClientRouting(
        MessageTypes.BROADCAST_TO_MEETING,
        props.meetingProp.intId,
        msg.body.setBy
      )
      val envelope = BbbCoreEnvelope(
        LockSettingsInMeetingChangedEvtMsg.NAME,
        routing
      )
      val body = LockSettingsInMeetingChangedEvtMsgBody(
        disableCam = settings.disableCam,
        disableMic = settings.disableMic,
        disablePrivChat = settings.disablePrivChat,
        disablePubChat = settings.disablePubChat,
        lockedLayout = settings.lockedLayout,
        lockOnJoin = settings.lockOnJoin,
        lockOnJoinConfigurable = settings.lockOnJoinConfigurable,
        msg.body.setBy
      )
      val header = BbbClientMsgHeader(
        LockSettingsInMeetingChangedEvtMsg.NAME,
        props.meetingProp.intId,
        msg.body.setBy
      )

      outGW.send(BbbCommonEnvCoreMsg(envelope, LockSettingsInMeetingChangedEvtMsg(header, body)))

      processLockLayout(settings.lockedLayout, msg.body.setBy)
    }
  }

  def processLockLayout(lock: Boolean, setBy: String): Unit = {

    liveMeeting.lockLayout(lock)

    val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, setBy)
    val envelope = BbbCoreEnvelope(LockLayoutEvtMsg.NAME, routing)
    val header = BbbClientMsgHeader(LockLayoutEvtMsg.NAME, liveMeeting.props.meetingProp.intId, setBy)
    val body = LockLayoutEvtMsgBody(setBy, lock, affectedUsers)
    val event = LockLayoutEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

    outGW.send(msgEvent)

  }
}
