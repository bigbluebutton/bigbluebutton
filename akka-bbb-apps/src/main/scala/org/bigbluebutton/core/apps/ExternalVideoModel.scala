package org.bigbluebutton.core.apps

import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.MsgBuilder

object ExternalVideoModel {
  def setURL(externalVideoModel: ExternalVideoModel, externalVideoUrl: String): Unit = {
    externalVideoModel.externalVideoUrl = externalVideoUrl
  }

  def clear(externalVideoModel: ExternalVideoModel): Unit = {
    externalVideoModel.externalVideoUrl = ""
  }

  def stop(outGW: OutMsgRouter, liveMeeting: LiveMeeting): Unit = {
    if (!liveMeeting.externalVideoModel.externalVideoUrl.isEmpty) {
      liveMeeting.externalVideoModel.externalVideoUrl = ""

      val event = MsgBuilder.buildStopExternalVideoEvtMsg(liveMeeting.props.meetingProp.intId)
      outGW.send(event)
    }
  }
}

class ExternalVideoModel {
  private var externalVideoUrl = ""
}
