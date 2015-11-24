package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.OutMessageGateway

trait CaptionApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSendCaptionHistoryRequest(msg: SendCaptionHistoryRequest) {
    var history = captionModel.getHistory()

    outGW.send(new SendCaptionHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID, history))
  }
  /*
  def handleUpdateCaptionInfo(msg: UpdateCaptionInfo) {

  }
*/
  def handleEditCaptionHistoryRequest(msg: EditCaptionHistoryRequest) {
    captionModel.editHistory(msg.startIndex, msg.endIndex, msg.locale, msg.text)

    outGW.send(new EditCaptionHistoryReply(mProps.meetingID, mProps.recorded, msg.startIndex, msg.endIndex, msg.locale, msg.text))
  }

  def checkCaptionOwnerLogOut(userId: String) {
    //var transcript = findTranscriptByOwnerId(userId)

    //if (transcript
  }
}