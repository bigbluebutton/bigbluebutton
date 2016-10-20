package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import scala.collection.mutable.ArrayBuffer
import org.bigbluebutton.core.MeetingActor
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.LiveMeeting

trait CaptionApp {
  this: LiveMeeting =>

  val outGW: OutMessageGateway

  def handleSendCaptionHistoryRequest(msg: SendCaptionHistoryRequest) {
    var history = captionModel.getHistory()
    //println("Caption history requested " + history)
    outGW.send(new SendCaptionHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID, history))
  }

  def handleUpdateCaptionOwnerRequest(msg: UpdateCaptionOwnerRequest) {
    // clear owner from previous locale
    if (msg.ownerID.length > 0) {
      captionModel.findLocaleByOwnerId(msg.ownerID).foreach(t => {
        captionModel.changeTranscriptOwner(t, "")

        // send notification that owner has changed
        outGW.send(new UpdateCaptionOwnerReply(mProps.meetingID, mProps.recorded, t, captionModel.findLocaleCodeByLocale(t), ""))
      })
    }
    // create the locale if it doesn't exist
    if (captionModel.transcripts contains msg.locale) {
      captionModel.changeTranscriptOwner(msg.locale, msg.ownerID)
    } else { // change the owner if it does exist
      captionModel.newTranscript(msg.locale, msg.localeCode, msg.ownerID)
    }

    outGW.send(new UpdateCaptionOwnerReply(mProps.meetingID, mProps.recorded, msg.locale, msg.localeCode, msg.ownerID))
  }

  def handleEditCaptionHistoryRequest(msg: EditCaptionHistoryRequest) {
    captionModel.findLocaleByOwnerId(msg.userID).foreach(t => {
      if (t == msg.locale) {
        captionModel.editHistory(msg.startIndex, msg.endIndex, msg.locale, msg.text)

        outGW.send(new EditCaptionHistoryReply(mProps.meetingID, mProps.recorded, msg.userID, msg.startIndex, msg.endIndex, msg.locale, msg.localeCode, msg.text))
      }
    })
  }

  def checkCaptionOwnerLogOut(userId: String) {
    captionModel.findLocaleByOwnerId(userId).foreach(t => {
      captionModel.changeTranscriptOwner(t, "")

      // send notification that owner has changed
      outGW.send(new UpdateCaptionOwnerReply(mProps.meetingID, mProps.recorded, t, captionModel.findLocaleCodeByLocale(t), ""))
    })
  }
}