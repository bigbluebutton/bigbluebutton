package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ MeetingActor }

trait CaptionApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSendCaptionHistoryRequest(msg: SendCaptionHistoryRequest) {
    val history = liveMeeting.captionModel.getHistory()
    //println("Caption history requested " + history)
    outGW.send(new SendCaptionHistoryReply(mProps.meetingID, mProps.recorded, msg.requesterID, history))
  }

  def handleUpdateCaptionOwnerRequest(msg: UpdateCaptionOwnerRequest) {
    // clear owner from previous locale
    if (msg.ownerID.length > 0) {
      liveMeeting.captionModel.findLocaleByOwnerId(msg.ownerID).foreach(t => {
        liveMeeting.captionModel.changeTranscriptOwner(t, "")

        // send notification that owner has changed
        outGW.send(new UpdateCaptionOwnerReply(mProps.meetingID, mProps.recorded, t, liveMeeting.captionModel.findLocaleCodeByLocale(t), ""))
      })
    }
    // create the locale if it doesn't exist
    if (liveMeeting.captionModel.transcripts contains msg.locale) {
      liveMeeting.captionModel.changeTranscriptOwner(msg.locale, msg.ownerID)
    } else { // change the owner if it does exist
      liveMeeting.captionModel.newTranscript(msg.locale, msg.localeCode, msg.ownerID)
    }

    outGW.send(new UpdateCaptionOwnerReply(mProps.meetingID, mProps.recorded, msg.locale, msg.localeCode, msg.ownerID))
  }

  def handleEditCaptionHistoryRequest(msg: EditCaptionHistoryRequest) {
    liveMeeting.captionModel.findLocaleByOwnerId(msg.userID).foreach(t => {
      if (t == msg.locale) {
        liveMeeting.captionModel.editHistory(msg.startIndex, msg.endIndex, msg.locale, msg.text)

        outGW.send(new EditCaptionHistoryReply(mProps.meetingID, mProps.recorded, msg.userID, msg.startIndex, msg.endIndex, msg.locale, msg.localeCode, msg.text))
      }
    })
  }

  def checkCaptionOwnerLogOut(userId: String) {
    liveMeeting.captionModel.findLocaleByOwnerId(userId).foreach(t => {
      liveMeeting.captionModel.changeTranscriptOwner(t, "")

      // send notification that owner has changed
      outGW.send(new UpdateCaptionOwnerReply(mProps.meetingID, mProps.recorded, t, liveMeeting.captionModel.findLocaleCodeByLocale(t), ""))
    })
  }
}