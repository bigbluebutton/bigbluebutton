package org.bigbluebutton.core.apps.timer

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.apps.{ TimerModel, PermissionCheck, RightsManagementTrait }

trait SetTrackReqMsgHdlr extends RightsManagementTrait {
  this: TimerApp2x =>

  def handle(msg: SetTrackReqMsg, liveMeeting: LiveMeeting, bus: MessageBus): Unit = {
    log.debug("Received setTrackReqMsg {}", SetTrackReqMsg)
    def broadcastEvent(
        track: String
    ): Unit = {
      val routing = collection.immutable.HashMap("sender" -> "bbb-apps-akka")
      val envelope = BbbCoreEnvelope(SetTrackRespMsg.NAME, routing)
      val header = BbbCoreHeaderWithMeetingId(
        SetTrackRespMsg.NAME,
        liveMeeting.props.meetingProp.intId
      )
      val body = SetTrackRespMsgBody(msg.header.userId, track)
      val event = SetTrackRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      bus.outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId) &&
      permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "You need to be the presenter or moderator to set track"
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
    } else {
      TimerModel.setTrack(liveMeeting.timerModel, msg.body.track)
      broadcastEvent(msg.body.track)
    }
  }
}