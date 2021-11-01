package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetScreenSubscribePermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetScreenSubscribePermissionReqMsg(msg: GetScreenSubscribePermissionReqMsg) {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (!user.userLeftFlag.left
        && liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && liveMeeting.props.voiceProp.voiceConf == msg.body.voiceConf
        && ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel) == msg.body.streamId) {
        allowed = true
      }
    }

    val event = MsgBuilder.buildGetScreenSubscribePermissionRespMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      msg.body.userId,
      msg.body.streamId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
