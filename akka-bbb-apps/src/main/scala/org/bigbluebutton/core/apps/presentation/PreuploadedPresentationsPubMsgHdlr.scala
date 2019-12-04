package org.bigbluebutton.core.apps.presentation

import org.bigbluebutton.common2.domain.PageVO
import org.bigbluebutton.common2.msgs.PreuploadedPresentationsSysPubMsg
import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.running.{ LiveMeeting }

trait PreuploadedPresentationsPubMsgHdlr {
  this: PresentationApp2x =>

  def handle(
      msg:         PreuploadedPresentationsSysPubMsg,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): Unit = {

    val presos = new collection.mutable.HashMap[String, Presentation]

    msg.body.presentations.foreach { pres =>
      val pages = new collection.mutable.HashMap[String, PageVO]()

      pres.pages.foreach { p =>
        val page = new PageVO(p.id, p.num, p.thumbUri, p.swfUri, p.txtUri, p.svgUri, p.current, p.xOffset, p.yOffset,
          p.widthRatio, p.heightRatio)
        pages += page.id -> page
      }

      val pr = new Presentation(pres.id, pres.name, pres.current,
        pages.toMap, pres.downloadable)
      presos += pres.id -> pr
    }

    processPreuploadedPresentations(liveMeeting, presos.values.toVector)

    msg.body.presentations foreach (presentation => {
      broadcastNewPresentationEvent(msg.header.userId, presentation, liveMeeting, bus)
    })
  }
}
