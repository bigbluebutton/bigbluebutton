package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ TimerModel, PermissionCheck, RightsManagementTrait }

trait StopTimerReqMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: StopTimerReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received stopTimerReqMsg {}", StopTimerReqMsg)
    def broadcastEvent(
        accumulated: Int
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(StopTimerRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        StopTimerRespMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = StopTimerRespMsgBody(msg.header.userId, accumulated)
      val event = StopTimerRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      msg.header.userId != "nodeJSapp") {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to stop timer"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      TimerModel.setAccumulated(liveMeeting.timerModel, msg.body.accumulated)
      TimerModel.setRunning(liveMeeting.timerModel, false)
      broadcastEvent(msg.body.accumulated)
    }
  }
}