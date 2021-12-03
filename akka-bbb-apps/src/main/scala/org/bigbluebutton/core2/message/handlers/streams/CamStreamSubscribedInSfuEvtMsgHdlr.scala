package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.{ Users2x }
import org.bigbluebutton.core.models.Webcams.{ findWithStreamId, addViewer }
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.LockSettingsUtil

trait CamStreamSubscribedInSfuEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def isAllowedToSubscribeToCam(userId: String, streamId: String): Boolean = {
    var allowed = false

    for {
      user <- Users2x.findWithIntId(liveMeeting.users2x, userId)
      stream <- findWithStreamId(liveMeeting.webcams, streamId)
    } yield {
      val camSubscribeLocked = LockSettingsUtil.isCameraSubscribeLocked(user, stream, liveMeeting)
      if (!user.userLeftFlag.left
        && (applyPermissionCheck && !camSubscribeLocked)) {
        allowed = true
      }
    }

    allowed
  }

  def handleCamStreamSubscribedInSfuEvtMsg(msg: CamStreamSubscribedInSfuEvtMsg) {
    // Subscriber's user ID
    val userId = msg.header.userId
    // Publisher's stream ID
    val streamId = msg.body.streamId
    val allowed = isAllowedToSubscribeToCam(userId, streamId)

    if (allowed) {
      addViewer(liveMeeting.webcams, streamId, userId)
    } else {
      val event = MsgBuilder.buildCamStreamUnsubscribeSysMsg(
        liveMeeting.props.meetingProp.intId,
        userId,
        streamId
      )
      outGW.send(event)
    }
  }
}
