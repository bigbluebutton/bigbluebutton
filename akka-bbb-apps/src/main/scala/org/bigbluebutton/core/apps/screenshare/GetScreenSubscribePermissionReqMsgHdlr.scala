package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.{ Screenshares, Users2x }
import org.bigbluebutton.core.apps.ScreenshareModel
import org.bigbluebutton.core2.message.senders.MsgBuilder

trait GetScreenSubscribePermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetScreenSubscribePermissionReqMsg(msg: GetScreenSubscribePermissionReqMsg) {
    var allowed = false
    val isLiveKit = liveMeeting.props.meetingProp.screenShareBridge == "livekit"

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      if (liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && liveMeeting.props.voiceProp.voiceConf == msg.body.voiceConf) {
        if (isLiveKit) {
          allowed = Screenshares.hasStream(liveMeeting.screenshares, msg.body.streamId)
        } else {
          allowed = ScreenshareModel.getRTMPBroadcastingUrl(liveMeeting.screenshareModel) == msg.body.streamId
        }
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
