package org.bigbluebutton.core2.message.handlers

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.core.models.Webcams.{ removeViewer }

trait CamStreamUnsubscribedInSfuEvtMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleCamStreamUnsubscribedInSfuEvtMsg(msg: CamStreamUnsubscribedInSfuEvtMsg) {
    // Subscriber's user ID
    val userId = msg.header.userId
    // Publisher's stream ID
    val streamId = msg.body.streamId

    removeViewer(liveMeeting.webcams, streamId, userId)
  }
}
