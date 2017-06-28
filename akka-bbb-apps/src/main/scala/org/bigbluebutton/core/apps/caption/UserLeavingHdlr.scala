package org.bigbluebutton.core.apps.caption

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.MeetingActor

trait UserLeavingHdlr {
  this: CaptionApp2x =>

  val outGW: OutMessageGateway

  def handleUserLeavingMsg(userId: String): Unit = {
    for {
      transcriptInfo <- checkCaptionOwnerLogOut(userId)
    } yield {
      broadcastUpdateCaptionOwnerEvent(transcriptInfo._1, transcriptInfo._2.localeCode, transcriptInfo._2.ownerId)
    }
  }
}

