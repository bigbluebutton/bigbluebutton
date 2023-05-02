package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ TimerModel, PermissionCheck, RightsManagementTrait }

trait SwitchTimerReqMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: SwitchTimerReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received switchTimerReqMsg {}", SwitchTimerReqMsg)
    def broadcastEvent(
        stopwatch: Boolean
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(SwitchTimerRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        SwitchTimerRespMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = SwitchTimerRespMsgBody(msg.header.userId, stopwatch)
      val event = SwitchTimerRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to switch timer"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      if (TimerModel.getStopwatch(liveMeeting.timerModel) != msg.body.stopwatch) {
        TimerModel.setStopwatch(liveMeeting.timerModel, msg.body.stopwatch)
        broadcastEvent(msg.body.stopwatch)
      } else {
        log.debug("Timer is already in this stopwatch mode");
      }
    }
  }
}