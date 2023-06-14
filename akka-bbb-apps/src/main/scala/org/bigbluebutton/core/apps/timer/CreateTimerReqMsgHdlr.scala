package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ TimerModel, PermissionCheck, RightsManagementTrait }

trait CreateTimerPubMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: CreateTimerPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    val isTimerFeatureEnabled: Boolean = !liveMeeting.props.meetingProp.disabledFeatures.contains("timer")

    if (!isTimerFeatureEnabled) {
      log.error("Timer feature is disabled for meeting {}, meetingId={}", liveMeeting.props.meetingProp.name,
        liveMeeting.props.meetingProp.intId)
    } else {
      log.debug("Received CreateTimerPubMsg {}", CreateTimerPubMsg)
      TimerModel.createTimer(liveMeeting.timerModel, msg.body.stopwatch, msg.body.time, msg.body.accumulated, msg.body.track)
    }
  }
}
