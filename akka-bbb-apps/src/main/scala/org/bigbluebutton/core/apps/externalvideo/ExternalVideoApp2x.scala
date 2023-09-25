package org.bigbluebutton.core.apps.externalvideo

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class ExternalVideoApp2x(implicit val context: ActorContext)
  extends StartExternalVideoPubMsgHdlr
  with UpdateExternalVideoPubMsgHdlr
  with StopExternalVideoPubMsgHdlr {

  val log = Logging(context.system, getClass)

}
