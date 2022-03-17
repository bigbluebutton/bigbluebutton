package org.bigbluebutton.core.apps.webcam

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.models.Webcams
import org.bigbluebutton.core.running.LiveMeeting

trait CamStreamUnsubscribedInSfuEvtMsgHdlr {
  this: WebcamApp2x =>

  def handle(
      msg:         CamStreamUnsubscribedInSfuEvtMsg,
      liveMeeting: LiveMeeting,
      bus:         MessageBus
  ) {

    Webcams.removeSubscriber(
      liveMeeting.webcams,
      msg.body.streamId,
      msg.header.userId
    )
  }
}
