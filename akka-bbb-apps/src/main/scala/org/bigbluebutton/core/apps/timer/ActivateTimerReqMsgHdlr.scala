package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ TimerModel, PermissionCheck, RightsManagementTrait }

trait ActivateTimerReqMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: ActivateTimerReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received ActivateTimerReqMsg {}", ActivateTimerReqMsg)
    def broadcastEvent(
        stopwatch:   Boolean,
        running:     Boolean,
        time:        Int,
        accumulated: Int,
        track:       String
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(ActivateTimerRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        ActivateTimerRespMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = ActivateTimerRespMsgBody(msg.header.userId, stopwatch, running, time, accumulated, track)
      val event = ActivateTimerRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to activate timer"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      TimerModel.reset(liveMeeting.timerModel, msg.body.stopwatch, msg.body.time, msg.body.accumulated, msg.body.timestamp, msg.body.track)
      TimerModel.setIsActive(liveMeeting.timerModel, true)
      broadcastEvent(msg.body.stopwatch, msg.body.running, msg.body.time, msg.body.accumulated, msg.body.track)
    }
  }
}