package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.LockSettingsUtil

trait GetCamBroadcastPermissionReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleGetCamBroadcastPermissionReqMsg(msg: GetCamBroadcastPermissionReqMsg) {
    var camBroadcastLocked: Boolean = false
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, msg.body.userId)
    } yield {
      camBroadcastLocked = LockSettingsUtil.isCameraBroadcastLocked(user, liveMeeting)

      if (!user.userLeftFlag.left
        && liveMeeting.props.meetingProp.intId == msg.body.meetingId
        && (applyPermissionCheck && !camBroadcastLocked)) {
        allowed = true
      }
    }

    val event = MsgBuilder.buildGetCamBroadcastPermissionRespMsg(
      liveMeeting.props.meetingProp.intId,
      msg.body.userId,
      msg.body.sfuSessionId,
      allowed
    )
    outGW.send(event)
  }
}
