package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.apps.webcam.CameraHdlrHelpers.permissionFailed
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.UserCameraDAO
import org.bigbluebutton.core.models.{ WebcamStream, Webcams }
import org.bigbluebutton.core.running.LiveMeeting

trait SetCamShowAsContentReqMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         SetCamShowAsContentReqMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ): Unit = {
    val meetingId = liveMeeting.props.meetingProp.intId

    def broadcastEvent(meetingId: String, userId: String, streamId: String, showAsContent: Boolean, setBy: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(SetCamShowAsContentEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(SetCamShowAsContentEvtMsg.NAME, meetingId, userId)
      val body = SetCamShowAsContentEvtMsgBody(streamId, showAsContent, setBy)
      val event = SetCamShowAsContentEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      bus.outGW.send(msgEvent)
    }

    val userIsPresenter = !permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)

    if (!userIsPresenter) {
      val reason = "No permission to set showAsContent for camera."
      PermissionCheck.ejectUserForFailedPermission(
        meetingId,
        msg.header.userId,
        reason,
        bus.outGW,
        liveMeeting
      )
    } else {
      for {
        webcam <- Webcams.findWithStreamId(liveMeeting.webcams, msg.body.streamId)
      } yield {
        if (webcam.contentType != "screenshare") {
          val reason = "Only screenshare can be set as content."
          PermissionCheck.ejectUserForFailedPermission(
            meetingId,
            msg.header.userId,
            reason,
            bus.outGW,
            liveMeeting
          )
        } else {
          broadcastEvent(meetingId, msg.header.userId, webcam.streamId, msg.body.showAsContent, msg.body.setBy)
          UserCameraDAO.updateShowAsContent(meetingId, webcam.streamId, msg.body.showAsContent)
        }
      }
    }
  }
}
