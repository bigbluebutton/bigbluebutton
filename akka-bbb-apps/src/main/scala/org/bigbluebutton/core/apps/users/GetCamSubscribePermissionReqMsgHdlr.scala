package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.{ Webcams }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetCamSubscribePermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetCamSubscribePermissionReqMsg(msg: GetCamSubscribePermissionReqMsg) {
    var allowed = false

    for {
      stream <- Webcams.findWithStreamId(liveMeeting.webcams, msg.body.streamId)
    } yield {
      allowed = CameraHdlrHelpers.isCameraSubscribeAllowed(
        liveMeeting,
        msg.body.meetingId,
        msg.body.userId,
        stream
      )
    }

    val event = MsgBuilder.buildGetCamSubscribePermissionRespMsg(
      liveMeeting.props.meetingProp.intId,
      msg.body.userId,
      msg.body.streamId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
