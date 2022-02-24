package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetCamBroadcastPermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetCamBroadcastPermissionReqMsg(msg: GetCamBroadcastPermissionReqMsg) {
    val allowed = CameraHdlrHelpers.isCameraBroadcastAllowed(
      liveMeeting,
      msg.body.meetingId,
      msg.body.userId,
      msg.body.streamId
    )

    val event = MsgBuilder.buildGetCamBroadcastPermissionRespMsg(
      liveMeeting.props.meetingProp.intId,
      msg.body.userId,
      msg.body.streamId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
