package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ TimerModel, PermissionCheck, RightsManagementTrait }

trait CreateTimerPubMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: CreateTimerPubMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received CreateTimerPubMsg {}", CreateTimerPubMsg)
    TimerModel.createTimer(liveMeeting.timerModel, msg.body.stopwatch, msg.body.time, msg.body.accumulated, msg.body.track)
  }
}