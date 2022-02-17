package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.{ Users2x, Webcams }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.LockSettingsUtil

trait GetCamSubscribePermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetCamSubscribePermissionReqMsg(msg: GetCamSubscribePermissionReqMsg) {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
      stream <- Webcams.findWithStreamId(liveMeeting.webcams, msg.body.streamId)
    } yield {
      val camSubscribeLocked = LockSettingsUtil.isCameraSubscribeLocked(user, stream, liveMeeting)

      if (!user.userLeftFlag.left
        && liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && (applyPermissionCheck && !camSubscribeLocked)) {
        allowed = true
      }
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
