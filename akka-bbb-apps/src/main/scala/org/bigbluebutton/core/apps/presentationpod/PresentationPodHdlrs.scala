package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.core.apps.presentationpod._
import akka.actor.ActorContext
import akka.event.Logging

class PresentationPodHdlrs(implicit val context: ActorContext)
    extends CreateNewPresentationPodPubMsgHdlr {

  val log = Logging(context.system, getClass)
}
