package org.bigbluebutton.core.apps.upload

import akka.actor.ActorContext
import akka.event.Logging

class UploadApp2x(implicit val context: ActorContext)
  extends UploadRequestReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
