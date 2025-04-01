package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.apps.webcam.CameraHdlrHelpers.permissionFailed
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.{ WebcamStream, Webcams }
import org.bigbluebutton.core.running.LiveMeeting

trait UserBroadcastCamStartMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         UserBroadcastCamStartMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(meetingId: String, userId: String, streamId: String, contentType: String, hasAudio: Boolean): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserBroadcastCamStartedEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserBroadcastCamStartedEvtMsg.NAME, meetingId, userId)
      val body = UserBroadcastCamStartedEvtMsgBody(userId, streamId, contentType, hasAudio)
      val event = UserBroadcastCamStartedEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val allowed = CameraHdlrHelpers.isCameraBroadcastAllowed(
      liveMeeting,
      msg.header.meetingId,
      msg.header.userId,
      msg.body.stream
    )

    if (!allowed) {
      val reason = "No permission to share camera."
      PermissionCheck.ejectUserForFailedPermission(
        meetingId,
        msg.header.userId,
        reason,
        bus.outGW,
        liveMeeting
      )
    } else {
      val userIsPresenter = !permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)
      val startAsContent = msg.body.contentType == "screenshare" && userIsPresenter
      val webcam = WebcamStream(msg.body.stream, msg.header.userId, msg.body.contentType, msg.body.hasAudio, showAsContent = startAsContent, Set.empty)

      for {
        _ <- Webcams.addWebcamStream(liveMeeting.props.meetingProp.intId, liveMeeting.webcams, webcam)
      } yield broadcastEvent(meetingId, msg.header.userId, msg.body.stream, msg.body.contentType, msg.body.hasAudio)
    }
  }
}
