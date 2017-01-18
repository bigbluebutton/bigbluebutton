package org.bigbluebutton.core.apps

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait CaptionApp {
  this: MeetingActor =>

  val outGW: OutMessageGateway
  val state: MeetingStateModel

  def handleSendCaptionHistoryRequest(msg: SendCaptionHistoryRequest) {
    var history = state.captionModel.getHistory()
    //println("Caption history requested " + history)
    outGW.send(new SendCaptionHistoryReply(state.mProps.meetingID, state.mProps.recorded, msg.requesterID, history))
  }

  def handleUpdateCaptionOwnerRequest(msg: UpdateCaptionOwnerRequest) {
    // clear owner from previous locale
    if (msg.ownerID.length > 0) {
      state.captionModel.findLocaleByOwnerId(msg.ownerID).foreach(t => {
        state.captionModel.changeTranscriptOwner(t, "")

        // send notification that owner has changed
        outGW.send(new UpdateCaptionOwnerReply(state.mProps.meetingID, state.mProps.recorded, t, state.captionModel.findLocaleCodeByLocale(t), ""))
      })
    }
    // create the locale if it doesn't exist
    if (state.captionModel.transcripts contains msg.locale) {
      state.captionModel.changeTranscriptOwner(msg.locale, msg.ownerID)
    } else { // change the owner if it does exist
      state.captionModel.newTranscript(msg.locale, msg.localeCode, msg.ownerID)
    }

    outGW.send(new UpdateCaptionOwnerReply(state.mProps.meetingID, state.mProps.recorded, msg.locale, msg.localeCode, msg.ownerID))
  }

  def handleEditCaptionHistoryRequest(msg: EditCaptionHistoryRequest) {
    state.captionModel.findLocaleByOwnerId(msg.userID).foreach(t => {
      if (t == msg.locale) {
        state.captionModel.editHistory(msg.startIndex, msg.endIndex, msg.locale, msg.text)

        outGW.send(new EditCaptionHistoryReply(state.mProps.meetingID, state.mProps.recorded, msg.userID, msg.startIndex, msg.endIndex, msg.locale, msg.localeCode, msg.text))
      }
    })
  }

  def checkCaptionOwnerLogOut(userId: String) {
    state.captionModel.findLocaleByOwnerId(userId).foreach(t => {
      state.captionModel.changeTranscriptOwner(t, "")

      // send notification that owner has changed
      outGW.send(new UpdateCaptionOwnerReply(state.mProps.meetingID, state.mProps.recorded, t, state.captionModel.findLocaleCodeByLocale(t), ""))
    })
  }
}