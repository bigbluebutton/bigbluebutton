package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.OutMessageGateway

trait CaptionApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSendCaptionHistoryRequest(msg: SendCaptionHistoryRequest) {
    var history = captionModel.getCaptionHistory()

    outGW.send(new SendCaptionHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID, history))
  }

  def handleNewCaptionLineRequest(msg: NewCaptionLineRequest) {
    captionModel.addNewCaptionLine(msg.locale, msg.text)

    outGW.send(new NewCaptionLineEvent(mProps.meetingID, mProps.recorded, msg.lineNumber, msg.locale, msg.startTime, msg.text))
  }
}