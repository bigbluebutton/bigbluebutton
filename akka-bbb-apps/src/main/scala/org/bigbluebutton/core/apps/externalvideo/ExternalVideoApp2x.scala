package org.bigbluebutton.core.apps.externalvideo

import akka.actor.ActorContext

class ExternalVideoApp2x(implicit val context: ActorContext)
  extends StartExternalVideoPubMsgHdlr
  with UpdateExternalVideoPubMsgHdlr
  with StopExternalVideoPubMsgHdlr {

}
