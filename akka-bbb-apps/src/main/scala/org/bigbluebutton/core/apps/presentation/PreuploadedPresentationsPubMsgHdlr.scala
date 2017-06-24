package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.common2.messages._

trait PreuploadedPresentationsPubMsgHdlr {
  this: PresentationApp2x =>

  val outGW: OutMessageGateway

  def handlePreuploadedPresentationsPubMsg(msg: PreuploadedPresentationsPubMsg): Unit = {
    processPreuploadedPresentations(msg.body.presentations)

    msg.body.presentations foreach (presentation => {
      broadcastNewPresentationEvent(msg.header.userId, presentation)
    })
  }
}