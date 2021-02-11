package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetGlobalAudioPermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetGlobalAudioPermissionReqMsg(msg: GetGlobalAudioPermissionReqMsg) {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (!user.userLeftFlag.left
        && liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && liveMeeting.props.voiceProp.voiceConf == msg.body.voiceConf) {
        allowed = true
      }
    }

    val event = MsgBuilder.buildGetGlobalAudioPermissionRespMsg(
      liveMeeting.props.meetingProp.intId,
      liveMeeting.props.voiceProp.voiceConf,
      msg.body.userId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
