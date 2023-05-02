package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ TimerModel, PermissionCheck, RightsManagementTrait }

trait DeactivateTimerReqMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: DeactivateTimerReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received deactivateTimerReqMsg {}", DeactivateTimerReqMsg)
    def broadcastEvent(): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(DeactivateTimerRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        DeactivateTimerRespMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = DeactivateTimerRespMsgBody(msg.header.userId)
      val event = DeactivateTimerRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to deactivate timer"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      TimerModel.setIsActive(liveMeeting.timerModel, false);
      broadcastEvent()
    }
  }
}