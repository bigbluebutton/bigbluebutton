package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.{ Users2x, Webcams }
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetCamSubscribePermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetCamSubscribePermissionReqMsg(msg: GetCamSubscribePermissionReqMsg) {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (!user.userLeftFlag.left
        && liveMeeting.props.meetingProp.intId == msg.body.meetingId) {
        Webcams.findWithStreamId(liveMeeting.webcams, msg.body.streamId) match {
          case Some(stream) => {
            allowed = true
          }
          case None => {
            allowed = false
          }
        }
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
