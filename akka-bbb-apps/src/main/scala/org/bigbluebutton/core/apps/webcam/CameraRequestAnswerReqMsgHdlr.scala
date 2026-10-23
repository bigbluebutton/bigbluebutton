package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.LiveMeeting

trait CameraRequestAnswerReqMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         CameraRequestAnswerReqMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId
    // Always the sender: a user may only answer their own camera request.
    val userId = msg.header.userId

    log.info(s"Camera request answered. meetingId=${meetingId} userId=${userId} accepted=${msg.body.accepted}")

    // Cleared either way: accepting proceeds through the regular broadcast flow.
    Users2x.setUserCameraRequested(liveMeeting.users2x, userId, requested = false)
  }
}
