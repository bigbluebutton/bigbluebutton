package org.bigbluebutton.core.apps.externalvideo

import akka.actor.ActorContext
import akka.event.Logging

class ExternalVideoApp2x(implicit val context: ActorContext)
  extends StartExternalVideoPubMsgHdlr
  with UpdateExternalVideoPubMsgHdlr
  with StopExternalVideoPubMsgHdlr {

  val log = Logging(context.system, getClass)

}
