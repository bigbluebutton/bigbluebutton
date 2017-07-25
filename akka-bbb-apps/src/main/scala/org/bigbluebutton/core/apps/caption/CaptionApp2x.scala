package org.bigbluebutton.core.apps.caption

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.msgs.TranscriptVO
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

class CaptionApp2x(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMsgRouter
)(implicit val context: ActorContext)
    extends UserLeavingHdlr
    with EditCaptionHistoryPubMsgHdlr
    with UpdateCaptionOwnerPubMsgHdlr
    with SendCaptionHistoryReqMsgHdlr {

  val log = Logging(context.system, getClass)

  def getCaptionHistory(): Map[String, TranscriptVO] = {
    liveMeeting.captionModel.getHistory()
  }

  def updateCaptionOwner(locale: String, localeCode: String, userId: String): Map[String, TranscriptVO] = {
    liveMeeting.captionModel.updateTranscriptOwner(locale, localeCode, userId)
  }

  def editCaptionHistory(userId: String, startIndex: Integer, endIndex: Integer, locale: String, text: String): Boolean = {
    liveMeeting.captionModel.editHistory(userId, startIndex, endIndex, locale, text)
  }

  def checkCaptionOwnerLogOut(userId: String): Option[(String, TranscriptVO)] = {
    liveMeeting.captionModel.checkCaptionOwnerLogOut(userId)
  }
}
