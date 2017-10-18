package org.bigbluebutton.core.apps.presentationpod

import akka.actor.ActorContext
import akka.event.Logging

class PresentationPodHdlrs(implicit val context: ActorContext)
    extends CreateNewPresentationPodPubMsgHdlr
    with GetPresentationInfoReqMsgHdlr
    with GetAllPresentationPodsReqMsgHdlr
    with SetCurrentPresentationPubMsgHdlr
    with PresentationConversionCompletedSysPubMsgHdlr
    with RemovePresentationPodPubMsgHdlr {

  val log = Logging(context.system, getClass)
}
